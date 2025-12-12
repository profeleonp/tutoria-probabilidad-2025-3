const API_URL = "http://127.0.0.1:8000";

async function getQuestions() {
  const res = await fetch(`${API_URL}/questions`);
  if (!res.ok) throw new Error(`getQuestions failed: ${res.status}`);
  return res.json();
}

async function getFullQuestion(id) {
  const res = await fetch(`${API_URL}/questions/${id}`);
  if (!res.ok) throw new Error(`getFullQuestion failed: ${res.status}`);
  return res.json();
}

async function generateProblem(id, paramsOverride = null, mode = "normal") {
  const res = await fetch(`${API_URL}/generate-problem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      params_override: paramsOverride,
      mode,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`generateProblem failed: ${res.status} -> ${text}`);
  }

  return res.json();
}

async function generateTest(numQuestions) {
  const res = await fetch(`${API_URL}/generate-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ num_questions: numQuestions }),
  });
  if (!res.ok) throw new Error(`generateTest failed: ${res.status}`);
  return res.json();
}

async function gradeTest(answers) {
  const res = await fetch(`${API_URL}/grade-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(`gradeTest failed: ${res.status}`);
  return res.json();
}

export default {
  getQuestions,
  getFullQuestion,
  generateProblem,
  generateTest,
  gradeTest,
};