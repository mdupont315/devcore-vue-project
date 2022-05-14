<template>
  <div>
    <div v-if="getValue">
      <layer style="z-index: 2" @closed="$emit('input', false)" />

      <div class="table-modal-prompt-wrapper">
        <div class="table-modal-prompt-container">
          <div class="table-modal-prompt-container-header">
            <div class="table-modal-prompt-text">
              {{ $t("AddNewTable") }}
            </div>

            <div class="table-modal-prompt-badge">
              <div class="table-modal-prompt-badge-text">
                {{ tableGridX }}
                x
                {{ tableGridY }}
                {{ $t("Table") }}
              </div>
            </div>
          </div>
          <div class="table-modal-prompt-container-body">
            <div
              class="table-modal-prompt-container-grid-container"
              :style="getGrid"
            >
              <div
                v-for="(i, index) in getGridTotal"
                style="border: 0.5px solid lightgray"
                :style="{
                  'grid-column-start': index % 1,
                  'grid-column-end': index % 1,
                  'grid-row-start': index % 1,
                  'grid-row-end': index % 1,
                  background:
                    i <= hoverPosition && calculateXY(index + 1)
                      ? '#ecf4fa'
                      : '#fff',
                  border:
                    i <= hoverPosition && calculateXY(index + 1)
                      ? '0.5px solid #4294d0'
                      : '0.5px solid lightgray',
                }"
                @click="toggleHoverAllow(index)"
                @mouseenter="setHoverPos(i)"
                @mouseleave="setHoverPos(null)"
                :key="index"
              ></div>
            </div>
          </div>
          <div class="table-modal-prompt-container-footer">
            <div class="table-modal-prompt-action">
              <loading-button
                :disabled="vErrors.any()"
                size="lg"
                style="height: 40px; width: 100%"
                @click="saveItem"
                block
                type="submit"
                >{{ $t("Insert") }} {{ $t("Table") }}</loading-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { TABLE_MAX_GRID_HEIGHT, TABLE_MAX_GRID_WIDTH } from "./constants";

export default {
  props: {
    value: {
      type: Boolean,
      default: () => false,
    },
  },
  methods: {
    saveItem() {
      this.$emit("tableCreate", {
        cols: this.tableGridX,
        rows: this.tableGridY,
      });
      this.hoverPosition = null;
      this.tableGridY = null;
      this.tableGridX = null;
    },
    calculateXY(number) {
      if (!number || !this.hoverPosition) return;
      if (this.hoverPosition === 100) return true;
      let _hoverPos = this.hoverPosition.toString();
      let _numberStr = number.toString();

      if (_numberStr < 10) {
        _numberStr = "0" + _numberStr;
      }

      if (this.hoverPosition < 10) {
        _hoverPos = "0" + _hoverPos;
      }

      _numberStr = [..._numberStr];
      _hoverPos = [..._hoverPos];

      if (_hoverPos[1] === "0") {
        return number <= this.hoverPosition;
      }

      if (_numberStr[1] === "0") {
        return false;
      }

      return _numberStr[1] <= _hoverPos[1];
    },
    toggleHoverAllow(index) {
      this.allowSelectionHover = !this.allowSelectionHover;
    },
    setHoverPos(number) {
      if (this.allowSelectionHover) {
        this.hoverPosition = number;

        if (number) {
          let _hoverPos = number.toString();
          if (number === 100) {
            this.tableGridX = 10;
            this.tableGridY = 10;
          } else if (number <= 10) {
            this.tableGridX = number;
            this.tableGridY = 1;
          } else if ([..._hoverPos][1] === "0") {
            this.tableGridY = [..._hoverPos][0];
            this.tableGridX = 10;
          } else if (number > 10 && number < 100) {
            this.tableGridX = parseInt([..._hoverPos][1]);
            this.tableGridY = parseInt([..._hoverPos][0]) + 1;
          } else {
            this.tableGridY = null;
            this.tableGridX = null;
          }
        }
      }
    },
  },
  data() {
    return {
      hoverPosition: null,
      tableGridX: null,
      tableGridY: null,
      tableGridMaxWidth: TABLE_MAX_GRID_WIDTH,
      tableGridMaxHeight: TABLE_MAX_GRID_HEIGHT,
      allowSelectionHover: true,
      tableSelectedGridWidth: 0,
      tableSelectedGridHeight: 0,
    };
  },
  computed: {
    getGridTotal: {
      get() {
        return this.tableGridMaxWidth * this.tableGridMaxHeight;
      },
    },
    getGrid: {
      get() {
        return {
          "--template-columns": this.tableGridMaxWidth,
          "--template-rows": this.tableGridMaxHeight,
          "--block-size": 16,
        };
      },
    },
    getValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("close", value);
      },
    },
  },
};
</script>

<style lang="scss">
.table-modal-prompt-wrapper {
  z-index: 2;
  position: absolute;
  width: 322px;
  height: 348px;
  margin: auto;
  position: absolute;
  top: 20%;
  left: 50%;
  margin-top: -50px;
  margin-left: -50px;
  border-radius: 3px;
}
.table-modal-prompt-container {
  background: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  border-radius: 3px;
}
.table-modal-prompt-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #ecf4fa;
  height: 30px;
  border-radius: 50px;
  color: #4294d0;
}

.table-modal-prompt-container-header,
.table-modal-prompt-container-body,
.table-modal-prompt-container-footer {
  padding: 5px 40px;
  align-self: center;
  width: 100%;
}

.table-modal-prompt-container-body {
  height: 100%;
  width: 100%;
}

.table-modal-prompt-body {
  height: 100%;
}

.table-modal-prompt-action {
  margin: 0 5px;
}

.table-modal-prompt-text {
  font-size: 18px;
  font-family: FuturaBold;
  display: flex;
  justify-content: center;
}

.table-modal-prompt-action {
  font-family: FuturaLight;
}

.table-modal-prompt-container-grid-container {
  border: 0.5px solid lightgray;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(var(--template-columns), 1fr);
  grid-template-rows: repeat(var(--template-rows), 1fr);
}
</style>


