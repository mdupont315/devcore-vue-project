<template>
	<div
		class="shadow"
		style="padding:8px; border-radius:5px;position:fixed; bottom:10px; right:10px; z-index:999;background:white; width:200px;font-size:14px;line-height:16px"
	>
		<span class="h6 d-block text-center">{{ $t('New content available!') }}</span>
		<hr class="my-1" />
		<span>{{ $t('We just found new content for the app!') }}</span>
		<hr class="my-1" />
		<div class="d-flex align-content-stretch">
			<b-button
				class="flex-grow-1"
				size="sm"
				variant="success"
				@click="refreshWindow"
			>{{ $t('Refresh now!') }}</b-button>
			<b-button
				class="flex-grow-1 text-gray"
				size="sm"
				variant="link"
				@click="dismiss"
			>{{ $t('Dismiss') }}</b-button>
		</div>
	</div>
</template>
<script>
export default {
	name: "SwUpdateFound",
	methods: {
		refreshWindow() {
			document.body.classList.remove("loaded");
			// window.location.reload();
		},
		dismiss() {
			this.$store.dispatch("app/wsUpdated", false);
		},
	},
};
</script>
