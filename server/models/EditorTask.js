import mongoose from "mongoose"

const editorTaskSchema = new mongoose.Schema(
  {
    sheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EditorSheet",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.EditorTask || mongoose.model("EditorTask", editorTaskSchema)
