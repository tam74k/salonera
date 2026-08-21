const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const target = "  const [previewBooking, setPreviewBooking] = useState<any>(null);";
const replacement = "  const [previewBooking, setPreviewBooking] = useState<any>(null);\n  const [showReviewModal, setShowReviewModal] = useState<any>(null);\n  const [currentImageIndex, setCurrentImageIndex] = useState(0);\n  const [rating, setRating] = useState(5);\n  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());";

content = content.replace(target, replacement);
fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Fixed states");
