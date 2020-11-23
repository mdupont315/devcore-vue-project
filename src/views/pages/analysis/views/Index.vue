<template>
	<div class="page animated fadeIn pgAnalysis">
		<div class="content-wrapper">
			<div class="left">
				<div class="left-top">
					<div class="left-top-first">
						{{title | formatTitle}}
					</div>
				</div>
				<div class="left-middle">
					<general></general>
				</div>
				<div class="left-bottom">
					<div class="left-bottom-first">
						<div class="left-bottom-first-label">START VALUE</div>
						<div class="left-bottom-first-value">130.060€</div>
					</div>
					<div class="left-bottom-second">
						<div class="left-bottom-second-label">VALUE THIS YEAR</div>
						<div class="left-bottom-second-value">216.189€</div>
					</div>
					<div class="left-bottom-third">
						<div class="left-bottom-third-label">POTENTIAL VALUE THIS YEAR</div>
						<div class="left-bottom-third-value">266.000€</div>
					</div>
				</div>

			</div>
			<div class="right">
				<div class="right-bottom__items">
					<div
						v-for="(tab,_, index) in getLabels"
						@click="setTabActive(tab,_,index)"
						class="analysis__topic-item"
						:class="index === activeIndex ? 'active' : 'inactive'"
						:key="index"
					>{{tab.toUpperCase() }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
/* import Chart from "./Chart"; */

import General from "./General";
import { tabLabels } from "@/lib/mode-enums.js";

export default {
	components: {
		general: General,
	},
	data() {
		return {
			activeIndex: 0,
			title: "savingsgrowth",
		};
	},
	filters: {
		formatTitle(text) {
			let formattedLabelText = "";

			switch (text) {
				case tabLabels.savingsgrowth.toString():
					formattedLabelText = "Savings + growth";
					break;
				case tabLabels.toolbenefits.toString():
					formattedLabelText = "Tool benefits";
					break;
				case tabLabels.operationbenefits:
					formattedLabelText = "Operation benefits";
					break;
				case tabLabels.operationvalue:
					formattedLabelText = "Operation value";
					break;
				default:
					formattedLabelText = "Savings + growth";
			}

			return formattedLabelText.toUpperCase();
		},
	},
	computed: {
		getTitle() {
			let formattedLabelText = "";
			switch (this.title) {
				case tabLabels.savingsgrowth:
					formattedLabelText = "Savings + growth";
					break;
				case tabLabels.toolbenefits:
					formattedLabelText = "Tool benefits";
					break;
				case tabLabels.operationbenefits:
					formattedLabelText = "Operation benefits";
					break;
				case tabLabels.operationvalue:
					formattedLabelText = "Operation value";
					break;
				default:
					formattedLabelText = "Savings + growth";
			}
			console.log("ADSJKSAJKSAJKDSAKJDSAK");
			return formattedLabelText.toUpperCase();
		},
		getLabels() {
			return tabLabels;
		},
	},
	methods: {
		setTabActive(tab, _, index) {
			this.title = tab;
			this.activeIndex = index;
		},
	},
};
</script>

<style lang="scss">
	.content-wrapper > .right {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
	}
	.left {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 20px;
	}

	.left-top-first {
		display: flex;
		justify-content: center;
		font-weight: 700;
		font-size: 11px;
		margin: 3%;
		text-transform: uppercase;
		font-size: 1.2em;
		line-height: 1.7em;
		letter-spacing: 1px;
		white-space: nowrap;
		border-bottom: 2px solid #F0F0F0;
	}
	.left-bottom-first,
	.left-bottom-second,
	.left-bottom-third {
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
	}

	.left-bottom-first-label,
	.left-bottom-second-label,
	.left-bottom-third-label {
		letter-spacing: 2px;
	}
	.left-bottom-first-value,
	.left-bottom-second-value,
	.left-bottom-third-value {
		font-size: 3em;
	}

	.left-bottom-second-value {
		color: lightblue;
	}

	.left-bottom {
		display: flex;
		margin: 5%;
		justify-content: space-evenly;
	}
	.analysis__topic-item {
		cursor: pointer;
		margin: 10%;
		text-transform: uppercase;
		font-size: 1.2em;
		line-height: 1.7em;
		letter-spacing: 1px;
		white-space: nowrap;
	}

	.analysis__topic-item.active {
		margin-left: 10%;
	}

	.analysis__topic-item.active:before {
		background-color: #fff;
		content: "";
		right: 12%;
		display: inline-block;
		height: 1px;
		position: relative;
		vertical-align: middle;
		width: 20px;
	}

	.left__tpoå {
		display: flex;
		justify-content: center;
		font-size: 1.2em;
	}
</style>
