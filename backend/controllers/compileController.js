import axios from "axios";
const GLOT_TOKEN = 'add7e1e1-75d8-4cfb-bf6a-33700064387a';

class compilerController {
  async compileCode(req, res) {
    const { language, code,input } = req.body;
   
    const response = await axios.post(
        `https://glot.io/api/run/${language}/latest`,
        {
          files: [{ name: 'main.' + getFileExtension(language), content: code }],
          stdin:input,
        },
        {
          headers: {
            'Authorization': `Token ${GLOT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
  
      const { stdout, stderr } = response.data;
      res.json({ output: stdout, error: stderr });
    }catch (error) {
        if (error.code === 'ECONNABORTED') {
          // Axios timeout
          res.status(408).json({ error: 'Time Limit Exceeded' });
        } else {
          res.status(500).json({ error: 'Code execution failed' });
        }
      }
  }

  const getFileExtension = (lang) => {
    const map = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      ruby: 'rb',
      rust: 'rs'
    };
    return map[lang] || 'txt';
  };

export default new compilerController();


