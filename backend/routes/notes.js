const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");
const fetchUser1 = require("../middleware/fetchUser2");

// Route 1: Get all the notes using: GET "/api/notes/fetchallnotes". Requires auth
router.get("/fetchallnotes", fetchUser1, async (req, res) => {
  try {
    // Fetch all notes associated with the authenticated user
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route 2: Add a new note using: POST "/api/notes/addnote". Requires auth
router.post(
  "/addnote",
  fetchUser1,
  [
    // Validate that the title is at least 3 characters long
    body("title", "Enter a valid title").isLength({ min: 3 }),
    // Validate that the description is at least 5 characters long
    body("description", "Description must be at least 5 characters long").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;
      // Create a new note object
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      // Save the note to the database
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error("Error adding note:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Route 3: Update an existing note using: PUT "/api/notes/updatenote/:id". Requires auth
router.put(
  "/updatenote/:id",
  fetchUser1,
  [
    // Validate that the title is at least 3 characters long
    body("title", "Enter a valid title").isLength({ min: 3 }),
    // Validate that the description is at least 5 characters long
    body("description", "Description must be at least 5 characters long").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    try {
      // Find the note by ID
      let note = await Notes.findById(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Ensure the note belongs to the authenticated user
      if (note.user.toString() !== req.user.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Update the note with the new data
      note = await Notes.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json(note);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Route 4: Delete an existing note using: DELETE "/api/notes/deletenote/:id". Requires auth
router.delete("/deletenote/:id", fetchUser1, async (req, res) => {
  try {
    // Find the note by ID
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Ensure the note belongs to the authenticated user
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete the note
    await Notes.findByIdAndDelete(req.params.id);
    res.json({ message: "Note has been deleted" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
