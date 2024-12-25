document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to navigation links based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSection) {
                link.classList.add('active');
            }
        });
    });
}); 

class GitHubContentFetcher {
    constructor(owner, repo) {
        this.owner = owner;
        this.repo = repo;
        this.baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    }

    async fetchContent(path) {
        try {
            const response = await fetch(`${this.baseUrl}/${path}`);
            if (!response.ok) throw new Error('Failed to fetch content');
            const data = await response.json();
            
            // If it's a file, decode the content
            if (!Array.isArray(data)) {
                return atob(data.content);
            }
            
            // If it's a directory, return the list of files
            return data;
        } catch (error) {
            console.error('Error fetching content:', error);
            throw error;
        }
    }
}

class QuestionModal {
    constructor() {
        this.modal = document.getElementById('questionModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.content = document.getElementById('questionContent');
        this.spinner = document.getElementById('loadingSpinner');
        this.closeBtn = document.querySelector('.close-modal');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.closeBtn.onclick = () => this.hide();
        window.onclick = (event) => {
            if (event.target === this.modal) {
                this.hide();
            }
        };
    }

    show(title) {
        this.modalTitle.textContent = title;
        this.modal.style.display = 'block';
        this.showSpinner();
    }

    hide() {
        this.modal.style.display = 'none';
        this.content.innerHTML = '';
    }

    showSpinner() {
        this.spinner.style.display = 'block';
        this.content.style.display = 'none';
    }

    hideSpinner() {
        this.spinner.style.display = 'none';
        this.content.style.display = 'block';
    }

    setContent(htmlContent) {
        this.content.innerHTML = htmlContent;
        this.hideSpinner();
    }
}

// Initialize the content fetcher and modal
const gitHubFetcher = new GitHubContentFetcher('avinash201199', 'Interviews-Resources');
const modal = new QuestionModal();

// Add click handlers to all view-more buttons
document.querySelectorAll('.view-more').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const card = button.closest('.category-card');
        const category = card.querySelector('h4').textContent;
        
        modal.show(category);
        
        try {
            // Map category titles to GitHub folder paths
            const pathMap = {
                'Data Structures & Algorithms': 'DSA',
                'Operating Systems': 'OS',
                'Computer Networks': 'Networking',
                'Java': 'Java',
                'Python': 'Python',
                'DBMS & SQL': 'DBMS'
            };
            
            const path = pathMap[category];
            if (!path) throw new Error('Category not found');
            
            const content = await gitHubFetcher.fetchContent(path);
            const formattedContent = formatContent(content);
            modal.setContent(formattedContent);
        } catch (error) {
            modal.setContent(`<p class="error">Failed to load content: ${error.message}</p>`);
        }
    });
});

function formatContent(content) {
    if (typeof content === 'string') {
        // Convert markdown to HTML (you might want to use a proper markdown parser)
        return `<div class="markdown-content">${content}</div>`;
    }
    
    // If it's a directory listing, format as a list
    return `
        <ul class="content-list">
            ${content.map(item => `
                <li>
                    <a href="${item.html_url}" target="_blank" rel="noopener noreferrer">
                        <i class="fas ${item.type === 'dir' ? 'fa-folder' : 'fa-file'}"></i>
                        ${item.name}
                    </a>
                </li>
            `).join('')}
        </ul>
    `;
} 