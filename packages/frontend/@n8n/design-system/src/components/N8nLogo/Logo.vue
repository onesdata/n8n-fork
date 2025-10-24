<script setup lang="ts">
import { useFavicon } from '@vueuse/core';
import { computed, onMounted, useCssModule, useTemplateRef } from 'vue';

import LogoIcon from './logo-icon.svg';
import LogoText from './logo-text.svg';

const props = defineProps<
	(
		| {
				size: 'large';
		  }
		| {
				size: 'small';
				collapsed: boolean;
		  }
	) & {
		releaseChannel: 'stable' | 'beta' | 'nightly' | 'dev';
	  aitProjectStage: 'prod' | 'staging' | 'test' | 'local';
	}
>();

const { size, releaseChannel, aitProjectStage } = props;

const showAitProjectStageTag = computed(() => {
	if (size === 'large') return true;
	return !props.collapsed;
});

const showLogoText = computed(() => {
	if (size === 'large') return true;
	return !props.collapsed;
});

const $style = useCssModule();
const containerClasses = computed(() => {
	if (size === 'large') {
		return [$style.logoContainer, $style.large];
	}
	return [
		$style.logoContainer,
		$style.sidebar,
		props.collapsed ? $style.sidebarCollapsed : $style.sidebarExpanded,
	];
});

const svg = useTemplateRef<{ $el: Element }>('logo');
onMounted(() => {
	if (!('createObjectURL' in URL)) return;

	const logoEl = svg.value!.$el;

	let stageColor;

	switch (aitProjectStage) {
		case 'local':
			stageColor = '#0015ff';
			break;
		case 'test':
			stageColor = '#49d204';
			break;
		case 'staging':
			stageColor = '#fdd404';
			break;
		case 'prod':
			stageColor = '#fa2602';
			break;
	}

	if (!stageColor && releaseChannel !== 'dev') return;

	// The logo uses a CSS variable. The favicon needs a fixed SVG color.
	if (stageColor) logoEl.style.setProperty('--logo-icon-fill', stageColor);
	const faviconColor = stageColor ?? '#898989';
	const faviconSvg = logoEl.outerHTML.replace('>', `><style>path { fill: ${faviconColor}; }</style>`);
	const blob = new Blob([faviconSvg], { type: 'image/svg+xml' });

	useFavicon(URL.createObjectURL(blob));
});
</script>

<template>
	<div :class="containerClasses" data-test-id="n8n-logo">
		<LogoIcon ref="logo" :class="[$style.logo, { [$style.dev]: releaseChannel === 'dev' }]" />
		<LogoText v-if="showLogoText" :class="$style.logoText" />
		<div v-if="showAitProjectStageTag" :class="$style.aitProjectStageTag">{{ aitProjectStage }}</div>
		<slot />
	</div>
</template>

<style lang="scss" module>
.logoContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: var(--spacing--3xs);
	fill: var(--text-color--subtler);
}

.logo,
.logoText {
	width: auto;
	height: var(--height--3xs);
	max-width: 100%;
}

.logo {
	--logo-icon-fill: var(--background--brand);

	&.dev {
		--logo-icon-fill: var(--text-color--subtler);
	}

	path {
		fill: var(--logo-icon-fill);
	}
}

.logoText path {
	fill: var(--text-color);
}

.aitProjectStageTag {
	color: var(--color--text--shade-1);
	padding: var(--spacing--4xs);
	background-color: var(--color--background--shade-1);
	border: 1px solid var(--color--background--shade-2);
	border-radius: var(--radius--lg);
	font-size: var(--font-size--3xs);
	font-weight: var(--font-weight--bold);
	text-transform: capitalize;
	line-height: var(--line-height--xs);
	margin: 4px 0 0 10px;
}

.large {
	margin-bottom: var(--spacing--xl);

	.logo,
	.logoText {
		height: var(--height--2xs);
	}
}
</style>
