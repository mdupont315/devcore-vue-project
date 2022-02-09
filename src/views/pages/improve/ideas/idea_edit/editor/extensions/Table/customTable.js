"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionedTable = void 0;
var core_1 = require("@tiptap/core");
var extension_table_1 = require("@tiptap/extension-table");
exports.CaptionedTable = extension_table_1.Table.extend({
    name: "captionedTable",
    parseHTML: function () {
        return [
            {
                tag: "div",
                contentElement: "p",
                getAttrs: function (node) {
                    return node.className === "captioned-table" && null;
                }
            }
        ];
    },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return [
            "div",
            core_1.mergeAttributes(this.options.HTMLAttributes, {
                class: "captioned-table"
            }),
            ["table", HTMLAttributes, ["tbody", 0]],
            ["p", 0]
        ];
    },
    addCommands: function () {
        var _this = this;
        return {
            insertCaptionedTable: function (_a) {
                var caption = _a.caption, _b = _a.rows, rows = _b === void 0 ? 3 : _b, _c = _a.cols, cols = _c === void 0 ? 3 : _c, _d = _a.withHeaderRow, withHeaderRow = _d === void 0 ? true : _d;
                return function (_a) {
                    var chain = _a.chain;
                    return chain()
                        .insertContent({
                        type: _this.name,
                        content: [{ type: "text", text: caption }]
                    })
                        .command(function (_a) {
                        var tr = _a.tr, commands = _a.commands;
                        var doc = tr.doc, selection = tr.selection;
                        var tablePositionStart = doc.resolve(selection.to - 1).start();
                        // Select embedded table, and replace with a table node
                        commands.setNodeSelection(tablePositionStart);
                        return commands.insertTable({
                            rows: rows,
                            cols: cols,
                            withHeaderRow: withHeaderRow
                        });
                    })
                        .run();
                };
            }
        };
    }
});
