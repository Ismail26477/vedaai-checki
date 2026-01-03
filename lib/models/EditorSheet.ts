import mongoose from "mongoose"

interface IEditorSheetTask {
  _id: mongoose.Types.ObjectId
  date: string
  title: string
  link?: string
}

export interface IEditorSheet extends mongoose.Document {
  employeeId: mongoose.Types.ObjectId
  employeeName: string
  sheetName: string
  tasks: IEditorSheetTask[]
  createdAt: Date
  updatedAt: Date
}

const editorSheetTaskSchema = new mongoose.Schema<IEditorSheetTask>(
  {
    date: { type: String, required: true },
    title: { type: String, required: true },
    link: { type: String },
  },
  { _id: true },
)

const editorSheetSchema = new mongoose.Schema<IEditorSheet>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    sheetName: {
      type: String,
      required: true,
    },
    tasks: [editorSheetTaskSchema],
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.EditorSheet || mongoose.model<IEditorSheet>("EditorSheet", editorSheetSchema)
