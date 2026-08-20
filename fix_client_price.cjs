const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const oldPrice = `<span className={\`font-bold \${isSelected ? 'text-indigo-600' : 'text-slate-600'}\`}>
                      SAR {service.price}
                    </span>`;

const newPrice = `<span className={\`font-bold \${isSelected ? 'text-indigo-600' : 'text-slate-600'} flex flex-col items-end\`}>
                      {service.discount_price ? (
                        <>
                          <span className="text-xs line-through opacity-50">SAR {service.original_price}</span>
                          <span className="text-emerald-600">SAR {service.discount_price}</span>
                        </>
                      ) : (
                        <span>SAR {service.original_price}</span>
                      )}
                    </span>`;

content = content.replace(oldPrice, newPrice);

// Also update the total cost calculation in booking details summary!
content = content.replace("totalCost = selectedServices.reduce((sum, serviceId) => {", "totalCost = selectedServices.reduce((sum, serviceId) => {");
content = content.replace("return sum + (s ? parseFloat(s.price) : 0);", "return sum + (s ? parseFloat(s.discount_price || s.original_price) : 0);");

fs.writeFileSync('src/screens/ClientApp.tsx', content);
