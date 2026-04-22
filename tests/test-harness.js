const tests = [];
const todos = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function todo(name) {
  todos.push(name);
}

async function run() {
  let failed = 0;

  for (const entry of tests) {
    try {
      await entry.fn();
      console.log(`PASS ${entry.name}`);
    } catch (error) {
      failed++;
      console.error(`FAIL ${entry.name}`);
      console.error(error && error.stack ? error.stack : error);
    }
  }

  for (const name of todos) {
    console.log(`TODO ${name}`);
  }

  console.log(`\nSummary: ${tests.length - failed}/${tests.length} passed, ${failed} failed, ${todos.length} todo`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

module.exports = {
  test,
  todo,
  run
};
