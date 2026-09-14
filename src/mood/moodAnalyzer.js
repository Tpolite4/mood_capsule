export function createMoodAnalyzer(historyLength = 8) {
  let expressionHistory = [];
  let moodLocked = false;
  let detectedMood = '';

  function addExpressions(expressions) {
    if (moodLocked) {
      return;
    }

    expressionHistory.push(expressions);
    console.log('Expression history:', expressionHistory);

    if (expressionHistory.length > historyLength) {
      expressionHistory.shift();
    }

    if (expressionHistory.length === historyLength) {
      detectedMood = getDominantEmotion();
      moodLocked = true;
    }
  }
  //after reading the 10 expressions; loop through to find the confidence scores per key
  //check if it is undefined and then total them up
  function getDominantEmotion() {
    const emotionTotals = {};

    for (const expressions of expressionHistory) {
      for (const keys of Object.keys(expressions)) {
        emotionTotals[keys] = (emotionTotals[keys] || 0) + expressions[keys];
      }
    }
    console.log('Emotion totals:', emotionTotals);

    let dominantEmotion = '';
    //initialize confidence score to 0
    let highestScore = 0;
    //loop through our totals and find the highest score among the emotions
    for (const emotion in emotionTotals) {
      if (emotionTotals[emotion] > highestScore) {
        highestScore = emotionTotals[emotion];
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }

  return {
    addExpressions,
    getMood: () => detectedMood,
    isLocked: () => moodLocked,
  };
}
