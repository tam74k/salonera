const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Update useAppContext
content = content.replace(
  "const { lang, isAr, role, user } = useAppContext();",
  "const { lang, isAr, role, user, setHeaderTitle } = useAppContext();"
);

const headerLogic = `
  useEffect(() => {
    const fetchHeaderData = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase.from('profiles').select('first_name_ar, first_name_en, last_name_ar, last_name_en').eq('id', user.id).single();
        let userName = '';
        if (profile) {
          userName = isAr ? \`\${profile.first_name_ar || ''} \${profile.last_name_ar || ''}\`.trim() : \`\${profile.first_name_en || ''} \${profile.last_name_en || ''}\`.trim();
        }

        let salonName = '';
        if (role === 'admin') {
          const { data: salon } = await supabase.from('salons').select('name_ar, name_en').eq('owner_id', user.id).single();
          if (salon) salonName = isAr ? salon.name_ar : salon.name_en;
        } else if (role === 'artist' || role === 'cashier') {
          const { data: stf } = await supabase.from('staff').select('salons(name_ar, name_en)').eq('profile_id', user.id).single();
          if (stf?.salons) {
            salonName = isAr ? stf.salons.name_ar : stf.salons.name_en;
          }
        }

        if (salonName && userName) {
          setHeaderTitle(\`\${salonName} - \${userName}\`);
        } else if (salonName) {
          setHeaderTitle(salonName);
        } else if (userName) {
          setHeaderTitle(userName);
        } else {
          setHeaderTitle('SALONERA');
        }
      } catch(err) {}
    };
    fetchHeaderData();
    
    return () => setHeaderTitle('');
  }, [user, role, isAr, setHeaderTitle]);
`;

content = content.replace(
  "useEffect(() => {\n    if (user) {\n      if (role === 'artist') {",
  headerLogic + "\n  useEffect(() => {\n    if (user) {\n      if (role === 'artist') {"
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Injected header logic");
