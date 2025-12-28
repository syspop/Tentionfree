const SITE_URL = 'https://tentionfree.store';

const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('data:image')) return 'DATA_URI_DETECTED'; // Mock for console

    // Clean leading slash
    const cleanPath = img.replace(/^\//, '');

    return `${SITE_URL}/${cleanPath.split('/').map(encodeURIComponent).join('/')}`;
};

// Test Cases
const cases = [
    'assets/images/Netflix.png',
    'assets/images/Google Ai Pro.png', // Spaces
    '/assets/images/Canva.png', // Leading slash
    'http://external.com/image.jpg',
    'data:image/png;base64,...'
];

cases.forEach(c => {
    console.log(`Input: "${c}" \nOutput: "${resolveImage(c)}"\n`);
});
