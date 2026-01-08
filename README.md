# FaceID
# Mood Capsule
*A mood-aware journaling application powered by facial analysis*

## Overview

Mood Capsule is a journaling application that uses webcam-based facial analysis to infer a user’s current mood and generate a context-aware affirmation. After receiving their mood and affirmation, users can write a journal entry, which is saved with a timestamp and can be revisited at any time.

The goal of the project is to reduce friction in self-reflection by helping users identify how they are feeling before journaling, rather than requiring them to self-diagnose their emotions upfront.

---

## How It Works

1. The application accesses the user’s webcam and analyzes facial expressions using a third-party facial analysis library.
2. The system infers a mood or emotional state based on detected facial features.
3. An affirmation is generated based on the detected mood:
   - celebratory when the mood is positive
   - supportive or grounding when the mood is neutral or negative
4. The user is prompted to write a journal entry.
5. The entry is saved with a timestamp and can be accessed later for reflection.

---

## Key Features

- Webcam-based mood detection using facial analysis
- Dynamic affirmation generation based on detected mood
- Guided journaling flow following mood analysis
- Persistent journal entries with timestamps
- Ability to review past entries at any time

---

## Technical Highlights

- Integrated a facial analysis library to infer user mood via webcam input
- Managed application state across webcam input, analysis results, and UI updates
- Implemented conditional logic to map detected moods to affirmations
- Persisted journal entries with date metadata for retrieval
- Designed a low-friction user experience focused on reflection and simplicity

---

## Privacy Considerations

Facial data is used only momentarily to infer mood and is not stored. Journal entries are saved locally or within application storage depending on configuration.

---

## Future Improvements

- Mood trend visualization over time
- User authentication and cloud-based persistence
- Customizable affirmation styles
- Manual mood override for user control
- Mobile responsiveness and accessibility enhancements

---

## Why I Built This

This project was initially prototyped during a hackathon and later reworked into a standalone application to explore the intersection of emotional awareness, user experience, and practical API integration.
