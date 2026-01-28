import { Schema } from "mongoose";

export const RowRangeSchema = new Schema(
  { start: { type: Number, min: 0 }, end: { type: Number, min: 0 } },
  { _id: false },
);

export const FilterSchema = new Schema(
  {
    column: { type: String, required: true },
    op: {
      type: String,
      required: true,
      enum: ["==", "!=", ">", ">=", "<", "<=", "in"],
    },
    value: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

export const SampleSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    n: { type: Number, min: 0, max: 1, default: null },
    frac: { type: Number, min: 0, max: 1, default: null },
    randomSeed: { type: Number, default: null },
  },
  { _id: false },
);

export const DataSelectionSchema = new Schema(
  {
    rows: { type: RowRangeSchema, default: null },
    columns: { type: [String], default: null },
    filters: { type: [FilterSchema], default: undefined },
    sample: { type: SampleSchema, default: undefined },
  },
  { _id: false },
);
