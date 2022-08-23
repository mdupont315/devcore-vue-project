<template>
	<div
		:class="'imageFileField' + cssClass + ' ' + (disabled?'disabled':'') +' ' + (uploading?'uploading':'')"
	>
		<div
			v-if="canDelete && !uploading"
			class="deleteIcon"
			@click.prevent="remove"
		>
			<i class="mdi mdi-trash-can" />
		</div>
		<div
			ref="display"
			class="display"
		>
			<div class="uploadIcon">
				<i
					v-if="disabled"
					class="mdi mdi-cancel disabled"
				/>
				<i
					v-else-if="uploading"
					class="mdi-upload mdi uploading animated fadeInUp infinite"
				/>
				<i
					v-else
					class="mdi mdi-cloud-upload"
				/>
			</div>

			<img
				:id="id + '-img'"
				ref="currentImageElement"
				class="showFile"
				:src="currentSrc"
			/>
		</div>
		<input
			:id="id + '-field'"
			ref="input"
			:disabled="disabled || uploading"
			type="file"
			class="file-field"
			@change="fileChanged($event)"
		/>
	</div>
</template>
<script>
import ImageResizer from "@/lib/image-resizer";

export default {
	name: "ImageUpload",
	props: {
		id: {
			type: String,
			default: "",
		},
		cssClass: {
			type: String,
			default: "",
		},
		currentImage: {
			type: String,
			default: "",
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		uploading: {
			type: Boolean,
			default: false,
		},
		canDelete: {
			type: Boolean,
			default: true,
		},
		onRemove: {
			type: Function,
			required: false,
		},
	},
	data() {
		return {
			resizer: new ImageResizer(),
			currentSrc: this.currentImage,
		};
	},
	computed: {
		image: {
			get() {
				return this.currentSrc;
			},
			set(value) {
				this.currentSrc = value;
			},
		},
	},
	mounted() {},
	methods: {
		remove(ev) {
			ev.stopPropagation();
			this.$emit("input", null);
			this.$emit("remove", null);
			this.image = null;
			if (this.onRemove) {
				this.onRemove(this, ev);
			}
		},
		fileChanged() {
			const dimensions = {
				h: this.$refs.display.clientHeight,
				w: this.$refs.display.clientWidth,
			};

			this.resizer.resize(
				this.$refs.input.files[0],
				{
					width: dimensions.w, // maximum width
					height: dimensions.h, // maximum height
				},
				(blob) => {
					const src = URL.createObjectURL(blob);
					this.currentSrc = src;
					setTimeout(() => {
						URL.revokeObjectURL(src);
					}, 0);
					console.log(this.$refs.input.files[0])
					this.$emit("input", this.$refs.input.files[0]);
				}
			);
		},
	},
};
</script>
