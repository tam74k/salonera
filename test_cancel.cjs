const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// Replace alerts with showToast in handleCancelBooking
content = content.replace(
  "alert(isAr ? 'تم إلغاء الحجز بنجاح' : 'Booking cancelled successfully');",
  "showToast(isAr ? 'تم إلغاء الحجز بنجاح' : 'Booking cancelled successfully', 'success');"
);
content = content.replace(
  "alert(isAr ? 'حدث خطأ أثناء الإلغاء' : 'Error cancelling booking');",
  "showToast(isAr ? 'حدث خطأ أثناء الإلغاء: ' + err.message : 'Error cancelling booking: ' + err.message, 'error');"
);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Success patching handleCancelBooking");
