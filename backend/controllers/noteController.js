const PersonalNote = require("../models/PersonalNote");

const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, message: msg });

exports.getNotes = async (req, res) => {
  try {
    const notes = await PersonalNote.find({ owner: req.user._id })
      .sort({ isPinned: -1, createdAt: -1 });
    return ok(res, { notes });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.createNote = async (req, res) => {
  try {
    const { text, isPinned, isReminder, reminderDate } = req.body;
    if (!text?.trim()) return fail(res, "text requis");

    const note = await PersonalNote.create({
      owner:     req.user._id,
      ownerRole: req.user.role,
      text: text.trim(),
      isPinned:     isPinned     || false,
      isReminder:   isReminder   || false,
      reminderDate: reminderDate || undefined,
    });
    return ok(res, { note }, 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await PersonalNote.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return fail(res, "Note introuvable", 404);

    const { text, isPinned, isDone, isReminder, reminderDate } = req.body;
    if (text         !== undefined) note.text         = text.trim();
    if (isPinned     !== undefined) note.isPinned     = isPinned;
    if (isDone       !== undefined) note.isDone       = isDone;
    if (isReminder   !== undefined) note.isReminder   = isReminder;
    if (reminderDate !== undefined) note.reminderDate = reminderDate;
    await note.save();
    return ok(res, { note });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await PersonalNote.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) return fail(res, "Note introuvable", 404);
    return ok(res, { message: "Note supprimée" });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
