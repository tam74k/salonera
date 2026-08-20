const fs = require('fs');
let content = fs.readFileSync('src/screens/Auth.tsx', 'utf8');

const useEffectStart = `  useEffect(() => {
    fetch('https://ipapi.co/json/')`;

const newUseEffect = `  // Reset fields when component mounts (i.e. login screen opened)
  useEffect(() => {
    setEmail('');
    setPassword('');
    setMobile('');
    setFirstNameAr('');
    setFirstNameEn('');
    setSalonNameAr('');
    setSalonNameEn('');
    setError('');
  }, []);

  useEffect(() => {
    fetch('https://ipapi.co/json/')`;

content = content.replace(useEffectStart, newUseEffect);
fs.writeFileSync('src/screens/Auth.tsx', content);
console.log("Added reset to Auth");
