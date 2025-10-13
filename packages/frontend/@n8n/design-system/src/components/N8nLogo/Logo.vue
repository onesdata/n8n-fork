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

	// Change the logo fill color inline, so that favicon can also use it
	let logoColor;

	switch (aitProjectStage) {
		case 'local':
			logoColor = '#0015ff';
			break;
		case 'test':
			logoColor = '#49d204';
			break;
		case 'staging':
			logoColor = '#fdd404';
			break;
		case 'prod':
			logoColor = '#fa2602';
			break;
	}

	if (logoColor) {
		logoEl.querySelector('path')?.setAttribute('fill', logoColor);
	}

	// Reuse the SVG as favicon
	const blob = new Blob([logoEl.outerHTML], { type: 'image/svg+xml' });
	useFavicon(URL.createObjectURL(blob));
});
</script>

<template>
	<div :class="containerClasses" data-test-id="n8n-logo">
		<LogoIcon ref="logo" :class="$style.logo" />
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
}

.logoText {
	margin-left: var(--spacing-5xs);
	path {
		fill: var(--color-text-dark);
	}
}

.aitProjectStageTag {
	color: var(--color-text-dark);
	padding: var(--spacing-5xs) var(--spacing-4xs);
	background-color: var(--color-background-base);
	border: 1px solid var(--color-foreground-base);
	border-radius: var(--border-radius-base);
	font-size: var(--font-size-3xs);
	font-weight: var(--font-weight-bold);
	text-transform: capitalize;
	line-height: var(--font-line-height-regular);
	margin: 8px 0 0 3px;
}

.authView {
	transform: scale(2);
	margin-bottom: var(--spacing-xl);

	.logo,
	.logoText {
		transform: scale(1.3);
	}

	.logoText {
		margin-left: var(--spacing-xs);
		margin-right: var(--spacing-3xs);
	}
}

.sidebarExpanded .logo {
	margin-left: var(--spacing-3xs);
}

.sidebarCollapsed .logo {
	width: 40px;
	height: 30px;
	padding: 0 var(--spacing-4xs);
}
</style>
