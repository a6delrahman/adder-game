// Frontend: SRQQuestions.jsx
import React, { useState } from 'react';
import axios from 'axios';

const SRQQuestions = () => {
  const [responses, setResponses] = useState({
    mot1: null,
    mot2: null,
    mot3: null,
    mot4: null,
    mot5: null,
    mot6: null,
    mot7: null,
    mot8: null,
    mot9: null,
    mot10: null,
    mot11: null,
    mot12: null,
    mot13: null,
    mot14: null,
    mot15: null,
    mot16: null,
    mot17: null,
  });

  const handleChange = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/srq-a', { responses });
      alert(`Fragebogen erfolgreich gespeichert! SDI: ${response.data.sdi}`);
    } catch (error) {
      console.error(error);
      alert('Fehler beim Speichern des Fragebogens.');
    }
  };

  const questions = [
    { key: 'mot1', text: '... weil es mir Spass macht.' },
    { key: 'mot2', text: '... weil ich möchte, dass mein Lehrer denkt, ich bin ein/e gute/r Schüler/in.' },
    { key: 'mot3', text: '... um später eine bestimmte Ausbildung machen zu können.' },
    { key: 'mot4', text: '... weil ich sonst von zu Hause Druck bekomme.' },
    { key: 'mot5', text: '... weil ich neue Dinge lernen möchte.' },
    { key: 'mot6', text: '... weil ich ein schlechtes Gewissen hätte, wenn ich wenig tun würde.' },
    { key: 'mot7', text: '... weil ich damit mehr Möglichkeiten bei der späteren Berufswahl habe.' },
    { key: 'mot8', text: '... weil ich sonst Ärger mit meinem/r Lehrer/in bekomme.' },
    { key: 'mot9', text: '... weil ich es geniesse, mich mit diesem Fach auseinanderzusetzen.' },
    { key: 'mot10', text: '... weil ich möchte, dass die anderen Schüler/innen von mir denken, dass ich ziemlich gut bin.' },
    { key: 'mot11', text: '... weil ich mit dem Wissen im Fach später einen besseren Job bekommen kann.' },
    { key: 'mot12', text: '... weil ich sonst schlechte Noten bekomme.' },
    { key: 'mot13', text: '... weil ich gerne Aufgaben aus diesem Fach löse.' },
    { key: 'mot14', text: '... weil ich mich vor mir selbst schämen würde, wenn ich es nicht tun würde.' },
    { key: 'mot15', text: '... weil ich die Sachen, die ich hier lerne, später gut gebrauchen kann.' },
    { key: 'mot16', text: '... weil ich es einfach lernen muss.' },
    { key: 'mot17', text: '... weil ich gerne über Dinge dieses Faches nachdenke.' },
  ];

  return (
      <form onSubmit={handleSubmit}>
        <p>Ich arbeite und lerne für das Fach Mathematik,...</p>
        {questions.map(q => (
            <div key={q.key}>
              <p>{q.text}</p>
              {[1, 2, 3, 4, 5].map(value => (
                  <label key={value}>
                    <input
                        type="radio"
                        name={q.key}
                        value={value}
                        onChange={() => handleChange(q.key, value)}
                        required
                    />
                    {value}
                  </label>
              ))}
            </div>
        ))}
        <button type="submit">Absenden</button>
      </form>
  );
};

export default SRQQuestions;