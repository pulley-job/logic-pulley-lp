const portfolioData = {
    "certifications": [
        { "name": "Google 認定トレーナー", "color": "blue", "icon": "school" },
        { "name": "Google ChromeOS 認定 Professional ChromeOS Administrator", "color": "red", "icon": "settings" },
        { "name": "Google データアナリティクス プロフェッショナル認定", "color": "yellow", "icon": "analytics" },
        { "name": "Google 認定教育者 レベル 1 / レベル 2", "color": "green", "icon": "workspace_premium" },
        { "name": "Gemini Education 認定", "color": "purple", "icon": "psychology" },
        { "name": "理学療法士", "color": "slate", "icon": "medical_services" }
    ],
    "works": [
        {
            "title": "Google認定トレーナーへの道（全4話）",
            "type": "Note",
            "category": "記事",
            "tags": ["資格取得", "体験記"],
            "link": "[https://note.com/lucky_pulley/n/n62733e447733](https://note.com/lucky_pulley/n/n62733e447733)",
            "color": "blue"
        },
        {
            "title": "Gemini 教育者向け認定プログラム解説",
            "type": "Note",
            "category": "記事",
            "tags": ["Gemini", "生成AI", "最新資格"],
            "link": "[https://note.com/lucky_pulley/n/n8f31b649af25](https://note.com/lucky_pulley/n/n8f31b649af25)",
            "color": "purple"
        },
        {
            "title": "AppSheet × Gemini AIアプリ開発",
            "type": "YouTube",
            "category": "動画",
            "tags": ["AppSheet", "Gemini API", "ノーコード"],
            "link": "[https://www.youtube.com/@jobpulley2023/videos](https://www.youtube.com/@jobpulley2023/videos)",
            "color": "red"
        },
        {
            "title": "Looker Studio Linking API 活用術",
            "type": "Note",
            "category": "記事",
            "tags": ["Looker Studio", "自動化", "API"],
            "link": "[https://note.com/lucky_pulley/n/n845a33b37121](https://note.com/lucky_pulley/n/n845a33b37121)",
            "color": "yellow"
        },
        {
            "title": "求人票入力フォームシステム",
            "type": "Note",
            "category": "記事",
            "tags": ["GAS", "Google Forms", "業務改善"],
            "link": "[https://note.com/lucky_pulley/n/n876fff387956](https://note.com/lucky_pulley/n/n876fff387956)",
            "color": "green"
        },
        {
            "title": "理学療法士国家試験合格への道",
            "type": "Note",
            "category": "記事",
            "tags": ["国家試験", "教育", "対策"],
            "link": "[https://note.com/lucky_pulley/n/nf56af92be10b](https://note.com/lucky_pulley/n/nf56af92be10b)",
            "color": "slate"
        },
        {
            "title": "RPG風 Google フォーム実装",
            "type": "YouTube",
            "category": "動画",
            "tags": ["GAS", "ゲーミフィケーション"],
            "link": "[https://www.youtube.com/@jobpulley2023/videos](https://www.youtube.com/@jobpulley2023/videos)",
            "color": "red"
        }
    ]
};

// Helper to extract URL from markdown [text](url) or return as is
function extractUrl(str) {
    const match = str.match(/\((.*?)\)$/);
    return match ? match[1] : str;
}

// Icon helper (using simple inline SVG paths based on logical names)
function getIconPath(iconName) {
    const icons = {
        'school': 'M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z',
        'settings': 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
        'analytics': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
        'workspace_premium': 'M9.68 13.69L12 11.93l2.31 1.76-.88-2.85L15.75 9h-2.84L12 6.19 11.09 9H8.25l2.31 1.84-.88 2.85zM20 10c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 2.03.76 3.87 2 5.28V23l6-2 6 2v-7.72A7.96 7.96 0 0 0 20 10z',
        'psychology': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z', // General brain/circle
        'medical_services': 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z'
    };
    return icons[iconName] || icons['school'];
}

function renderCertifications() {
    const grid = document.getElementById('certGrid');

    portfolioData.certifications.forEach((cert, index) => {
        const card = document.createElement('div');
        card.className = `cert-card border-${cert.color} animate delay-${(index % 3) + 1}`;
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="cert-icon text-${cert.color}">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="${getIconPath(cert.icon)}" />
                </svg>
            </div>
            <div class="cert-name">${cert.name}</div>
        `;

        grid.appendChild(card);
    });
}

function renderWorks(filter = 'all') {
    const grid = document.getElementById('worksGrid');
    grid.innerHTML = '';

    const filteredWorks = filter === 'all'
        ? portfolioData.works
        : portfolioData.works.filter(work => work.category === filter);

    filteredWorks.forEach((work, index) => {
        const url = extractUrl(work.link);

        const card = document.createElement('a');
        card.href = url;
        card.target = "_blank";
        card.className = `work-card border-${work.color} animate`;
        card.style.animationDelay = `${index * 0.1}s`;

        // Tags generation
        const tagsHtml = work.tags.map(tag => `<span class="work-tag">${tag}</span>`).join('');

        card.innerHTML = `
            <div class="work-card-content">
                <span class="work-category text-${work.color}">${work.category} / ${work.type}</span>
                <h3 class="work-title">${work.title}</h3>
                <div class="work-tags">
                    ${tagsHtml}
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function setupFilters() {
    const buttonContainer = document.getElementById('filterButtons');
    const categories = [...new Set(portfolioData.works.map(work => work.category))];

    // Default 'All' button is already in HTML, but let's clear and rebuild for dynamic purity
    buttonContainer.innerHTML = `<button class="filter-btn active" data-filter="all">All</button>`;

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = cat;
        btn.dataset.filter = cat;
        buttonContainer.appendChild(btn);
    });

    buttonContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Filter grid
            const filter = e.target.dataset.filter;
            renderWorks(filter);
        }
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderCertifications();
    setupFilters();
    renderWorks('all');
});
