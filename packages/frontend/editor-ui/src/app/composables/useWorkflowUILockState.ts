import { computed } from 'vue';

import { injectWorkflowDocumentStore } from '@/app/stores/workflowDocument.store';
import { useSettingsStore } from '@/app/stores/settings.store';
import { useTagsStore } from '@/features/shared/tags/tags.store';

/**
 * Returns reactive flags that lock the editor UI for the current workflow when
 * it carries one of the tags configured via `N8N_UI_READONLY_TAG` or
 * `N8N_UI_NOEXECUTE_TAG`. Both env vars are optional: when unset (empty
 * string) the corresponding flag is always `false` and behavior is unchanged.
 *
 * UI-only: the backend still accepts updates and executions, so the
 * programmatic promotion flow between environments keeps working.
 */
export function useWorkflowUILockState() {
	const workflowDocumentStore = injectWorkflowDocumentStore();
	const settingsStore = useSettingsStore();
	const tagsStore = useTagsStore();

	const readOnlyTagName = computed(
		() => settingsStore.settings?.workflowUILockTags?.readOnly ?? '',
	);
	const noExecuteTagName = computed(
		() => settingsStore.settings?.workflowUILockTags?.noExecute ?? '',
	);

	function workflowHasTagNamed(tagName: string): boolean {
		if (!tagName) return false;
		const tagIds = workflowDocumentStore.value?.tags ?? [];
		return tagIds.some((id) => tagsStore.tagsById[id]?.name === tagName);
	}

	const isReadOnlyByTag = computed(() => workflowHasTagNamed(readOnlyTagName.value));
	const isNonExecutableByTag = computed(() => workflowHasTagNamed(noExecuteTagName.value));

	return { isReadOnlyByTag, isNonExecutableByTag };
}
