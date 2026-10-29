import Bull from 'bull';
import { Redis } from 'ioredis';

import { JOB_TYPE_NAME } from '../constants';
import type { Job, JobData, JobQueue } from '../scaling.types';

const REDIS_HOST = process.env.N8N_TEST_REDIS_HOST;
const REDIS_PORT = Number(process.env.N8N_TEST_REDIS_PORT);

type RawQueue = JobQueue & {
	getNextJob(): Promise<Job | null | undefined>;
	moveUnlockedJobsToWait(): Promise<void>;
};

describe.skipIf(!REDIS_HOST || !REDIS_PORT)('stalled job priority cleanup (real Redis)', () => {
	it('should remove a failed stalled job from priority and keep later jobs in FIFO order', async () => {
		const redis = { host: REDIS_HOST, port: REDIS_PORT };
		const prefix = `stalled-priority-${process.pid}`;
		const queue = new Bull<JobData>('jobs', {
			prefix,
			redis,
			settings: { maxStalledCount: 0 },
		}) as RawQueue;
		const control = new Redis(redis);
		const key = (suffix: string) => `${prefix}:jobs:${suffix}`;
		const addJob = async () =>
			await queue.add(
				JOB_TYPE_NAME,
				{ executionId: 'exec-1', workflowId: 'wf-1', loadStaticData: false } as JobData,
				{ priority: 1 },
			);

		try {
			await queue.isReady();
			const stalled = await addJob();
			// Model a worker that stopped after taking a job, before it set the lock.
			await control.lrem(key('wait'), 0, String(stalled.id));
			await control.lpush(key('active'), String(stalled.id));
			for (let i = 0; i < 2; i++) {
				await control.del(key('stalled-check'));
				await queue.moveUnlockedJobsToWait();
			}

			expect(await stalled.getState()).toBe('failed');
			expect(await control.zcard(key('priority'))).toBe(0);

			const jobs: Job[] = [];
			for (let i = 0; i < 3; i++) jobs.push(await addJob());
			const order: Array<Job['id'] | undefined> = [];
			for (let i = 0; i < 3; i++) order.push((await queue.getNextJob())?.id);
			expect(order).toEqual(jobs.map((job) => job.id));
		} finally {
			await queue.close();
			const keys = await control.keys(`${prefix}:*`);
			if (keys.length > 0) await control.del(...keys);
			await control.quit();
		}
	});
});
