const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Find the fetchSalonAndBookings function
const fetchIndex = content.indexOf('const fetchSalonAndBookings = async () => {');
if (fetchIndex !== -1) {
    const endFetch = content.indexOf('setLoading(false);', fetchIndex);
    
    // Replace the salon fetch logic
    const oldLogic = `      const { data: salon } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_id', user?.id)
        .single();
      
      if (salon) {`;
      
    const newLogic = `      let { data: salon, error: fetchErr } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_id', user?.id)
        .single();
        
      if (!salon && user?.id) {
        // Try to create a default salon if not exists
        const { data: newSalon, error: createErr } = await supabase
          .from('salons')
          .insert({
             owner_id: user.id,
             name_ar: 'صالوني',
             name_en: 'My Salon',
             type: 'both'
          })
          .select()
          .single();
          
        if (newSalon) salon = newSalon;
      }
      
      if (salon) {`;
      
    content = content.replace(oldLogic, newLogic);
    
    // Fix the alert logic to be clearer
    content = content.replace(
      /if \(!newArtistData\.email \|\| !salonData\) \{[\s\S]*?return;\n\s*\}/,
      `if (!newArtistData.email) {
      alert("Please enter the email for the new artist");
      return;
    }
    if (!salonData) {
      alert("Error: Salon data not found for this account. Please contact support.");
      return;
    }`
    );
    
    fs.writeFileSync('src/screens/Dashboards.tsx', content);
    console.log("Fixed Dashboards.tsx");
}
