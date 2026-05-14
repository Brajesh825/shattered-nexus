import { exec } from "child_process";
import path from "path";
import util from "util";

const execAsync = util.promisify(exec);

export async function handleFetchAudio(args, rootDir) {
  const { query, filename, category } = args;

  const scriptPath = path.join(rootDir, "tools", "fetch_audio.py");
  
  // Build the command. We wrap query and filename in quotes to handle spaces.
  const command = `python "${scriptPath}" "${query}" "${filename}" --category ${category || 'bgm'}`;

  try {
    const { stdout, stderr } = await execAsync(command, { cwd: rootDir });
    return {
      content: [
        {
          type: "text",
          text: `🎵 Resonance Audio Pipeline Execution:\n\n${stdout}\n${stderr ? `Warnings/Errors:\n${stderr}` : ''}`
        }
      ]
    };
  } catch (err) {
    throw new Error(`Audio Fetch Failed: ${err.message}\n\nStdout: ${err.stdout}\nStderr: ${err.stderr}`);
  }
}
