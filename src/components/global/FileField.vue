<template>
	<div
		class="file-field"
		:class="{'has-file':file || currentFile}"
	>
		<i class="mdi mdi-folder-open-outline"></i> &nbsp;
		<a
			v-if="currentFile && !this.file"
			class="link title text-gray"
			target="_blank"
			:href="currentFile.downloadUrl"
		>{{ title }}</a>
		<span
			v-if="!this.file && !currentFile"
			class="title text-capitalize"
		>{{ placeholder || $t('Upload file') }}</span>
		&nbsp;
		<span class="field-wrapper">
			<span
				v-if="this.file"
				class="title text-gray"
				style="max-width:200px;overflow:hidden"
			>{{ this.file.name }}</span>
			&nbsp;
			<span
				v-if="file || currentFile"
				class="replace"
			>
				<i class="mdi mdi-pencil"></i>
				{{ $t('Change') }}
			</span>&nbsp;
			<input
				type="file"
				class="field"
				@change="fileChanged"
			/>
		</span>
		<span
			v-if="file || currentFile"
			class="remove"
			@click="remove"
		>
			<i class="mdi mdi-delete text-danger"></i>
			{{ $t('Remove') }}
		</span>
	</div>
</template>
<script>
export default {
	name: "FileField",
	props: {
		value: {
			required: false,
		},
		currentFile: {
			required: false,
		},
		title: {
			required: false,
		},
		placeholder: {
			required: false,
		},
	},
	data: () => ({
		file: null,
	}),
	mounted() {},
	methods: {
		fileChanged(event) {
			console.log(event);
			if (event.target.files[0]) {
				this.file = event.target.files[0];
			}
			this.$emit("input", this.file);
		},
		remove() {
			this.file = null;
			this.$emit("input", null);
		},
	},
};
</script>
