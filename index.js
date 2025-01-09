const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const math = require('mathjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input TEXT UNIQUE,
    responses TEXT
  )`);
});

async function translateAPI(text, lang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data && data.length > 0 && data[0].length > 0 && data[0][0].length > 0) {
      return data[0][0][0];
    } else {
      throw new Error("Unable to extract translated text from the API response.");
    }
  } catch (error) {
    throw new Error(`Error fetching translation: ${error.message}`);
  }
}

async function samirtranslate(text, lang = 'en') {
  if (typeof text !== "string") throw new Error("The first argument (text) must be a string");
  if (typeof lang !== "string") throw new Error("The second argument (lang) must be a string");
  return translateAPI(text, lang);
}

function evaluateMath(expression) {
  try {
    expression = expression.replace(/[^\d+\-*/().^√]/g, '');
    expression = expression.replace(/\^/g, '**').replace(/√([^)]+)/g, 'Math.sqrt($1)');
    const result = math.evaluate(expression);
    return result !== undefined ? result.toString() : null;
  } catch (error) {
    return null;
  }
}

function chooseRandomly(input) {
  const regex = /choose between\s+(.+?)\s+and\s+(.+)/i;
  const match = input.match(regex);
  if (match && match.length === 3) {
    const option1 = match[1].trim();
    const option2 = match[2].trim();
    const choices = [option1, option2];
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    return `I choose ${randomChoice}.`;
  } else {
    return 'Please provide a valid format: "choose between name1 and name2".';
  }
}

function getDateTimeInfo(query) {
  const now = new Date();
  if (/current date|what is the date|date/i.test(query)) {
    return `The current date is ${now.toLocaleDateString()}.`;
  }
  if (/what time is it|current time|time/i.test(query)) {
    return `The current time is ${now.toLocaleTimeString()}.`;
  }
  if (/time in bangladesh/i.test(query)) {
    const bangladeshTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    return `The current time in Bangladesh is ${bangladeshTime.toLocaleTimeString()}.`;
  }
  return null;
}

function toBoldMathematicalFont(text) {
  const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bold = '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇123456789';
  return text.split('').map(char => (normal.includes(char) ? bold[normal.indexOf(char)] : char)).join('');
}

app.post('/teach', async (req, res) => {
  const { input, response, lang = 'en' } = req.body;
  if (!input || !response) {
    return res.status(400).send({ error: 'Input and response are required.' });
  }
  const normalizedInput = input.toLowerCase();
  const translatedResponse = await samirtranslate(response, lang);
  db.get('SELECT responses FROM chat WHERE input = ?', [normalizedInput], (err, row) => {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    let responses = [];
    if (row) {
      responses = JSON.parse(row.responses);
      if (!responses.includes(translatedResponse)) {
        responses.push(translatedResponse);
        db.run('UPDATE chat SET responses = ? WHERE input = ?', [JSON.stringify(responses), normalizedInput], function (err) {
          if (err) {
            return res.status(500).send({ error: 'Database error while updating responses.' });
          }
          const styledMessage = toBoldMathematicalFont(`Response added: "${response}"`);
          return res.send({ message: styledMessage });
        });
      } else {
        const styledMessage = toBoldMathematicalFont(`Response already exists: "${response}"`);
        return res.send({ message: styledMessage });
      }
    } else {
      responses.push(translatedResponse);
      db.run('INSERT INTO chat (input, responses) VALUES (?, ?)', [normalizedInput, JSON.stringify(responses)], function (err) {
        if (err) {
          return res.status(500).send({ error: 'Database error while inserting new entry.' });
        }
        const styledMessage = toBoldMathematicalFont(`Response added: "${response}"`);
        return res.send({ message: styledMessage });
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
