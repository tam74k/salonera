const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const targetRegex = /const \[favorites, setFavorites\] = useState<string\[\]>\(\[\]\);\s*useEffect\(\(\) => \{\s*if \(user\) \{\s*const savedFavs = localStorage\.getItem\(`favorites_\$\{user\.id\}`\);\s*if \(savedFavs\) \{\s*try \{ setFavorites\(JSON\.parse\(savedFavs\)\); \} catch\(e\) \{\}\s*\}\s*\}\s*\}, \[user\]\);\s*const toggleFavorite = \(salonId: string, e\?: React\.MouseEvent\) => \{\s*if \(e\) e\.stopPropagation\(\);\s*setFavorites\(prev => \{\s*const newFavs = prev\.includes\(salonId\) \? prev\.filter\(id => id !== salonId\) : \[\.\.\.prev, salonId\];\s*if \(user\) \{\s*localStorage\.setItem\(`favorites_\$\{user\.id\}`, JSON\.stringify\(newFavs\)\);\s*\}\s*return newFavs;\s*\}\);\s*\};/g;

const replacement = `const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const { data } = await supabase.from('favorite_salons').select('salon_id').eq('user_id', user.id);
        if (data) {
          setFavorites(data.map(f => f.salon_id));
        }
      }
    };
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (salonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      showToast(isAr ? 'يرجى تسجيل الدخول أولاً' : 'Please login first', 'error');
      return;
    }
    
    const isFav = favorites.includes(salonId);
    
    // Optimistic UI update
    setFavorites(prev => isFav ? prev.filter(id => id !== salonId) : [...prev, salonId]);
    
    if (isFav) {
      const { error } = await supabase.from('favorite_salons').delete().eq('user_id', user.id).eq('salon_id', salonId);
      if (error) {
        setFavorites(prev => [...prev, salonId]);
        showToast(isAr ? 'حدث خطأ أثناء إزالة المفضلة' : 'Error removing favorite', 'error');
      }
    } else {
      const { error } = await supabase.from('favorite_salons').insert({ user_id: user.id, salon_id: salonId });
      if (error) {
        setFavorites(prev => prev.filter(id => id !== salonId));
        showToast(isAr ? 'حدث خطأ أثناء إضافة المفضلة' : 'Error adding favorite', 'error');
      }
    }
  };`;

if(content.match(targetRegex)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync('src/screens/ClientApp.tsx', content);
    console.log("Updated toggleFavorite successfully");
} else {
    console.log("Regex did not match");
}
