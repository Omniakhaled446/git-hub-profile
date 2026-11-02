const API_URL = 'https://api.github.com/users/';
const DEFAULT_USER = 'Omniakhaled446';

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const profileCard = document.getElementById('profile-card');
const reposContainer = document.getElementById('repos-container');
const contentContainer = document.getElementById('content-container');

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

themeToggleBtn.addEventListener('click', () => {
  const html = document.documentElement;
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    themeIcon.className = 'fa-solid fa-sun text-amber-500';
    themeText.innerText = 'الوضع الفاتح';
  } else {
    html.classList.add('dark');
    themeIcon.className = 'fa-solid fa-moon text-sky-500';
    themeText.innerText = 'الوضع الداكن';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  getUserData(DEFAULT_USER);
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = searchInput.value.trim();
  if (username) {
    getUserData(username);
  }
});

async function getUserData(username) {
  showLoading();
  try {
    const userRes = await fetch(`${API_URL}${username}`);
    
    if (!userRes.ok) {
      if (userRes.status === 404) {
        throw new Error('المستخدم غير موجود!');
      } else if (userRes.status === 403) {
        throw new Error('تم تجاوز حد طلبات الـ API، يرجى المحاولة لاحقاً');
      } else {
        throw new Error('حدث خطأ أثناء جلب البيانات');
      }
    }

    const userData = await userRes.json();
    
    let reposData = [];
    try {
      const reposRes = await fetch(`${API_URL}${username}/repos?sort=created&per_page=5`);
      if (reposRes.ok) {
        reposData = await reposRes.json();
      }
    } catch (repoErr) {
      console.error("Repos fetch error:", repoErr);
    }

    displayProfile(userData);
    displayRepos(reposData);
    showContent();
  } catch (error) {
    console.error("Fetch User Error:", error);
    showError(error.message);
  }
}

function displayProfile(user) {
  const createdDate = new Date(user.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  profileCard.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6 items-start">
      <img 
        src="${user.avatar_url}" 
        alt="${user.name || user.login}" 
        class="w-28 h-28 rounded-full border-4 border-sky-500 shadow-md mx-auto md:mx-0"
      />
      <div class="flex-1 w-full text-center md:text-right">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">${user.name || user.login}</h2>
            <a href="${user.html_url}" target="_blank" class="text-sky-500 dark:text-sky-400 hover:underline dir-ltr inline-block">@${user.login}</a>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            انضم: ${createdDate}
          </span>
        </div>
        <p class="text-slate-600 dark:text-slate-300 my-4 text-sm leading-relaxed">${user.bio || 'لا توجد سيرة ذاتية (Bio) مضافة.'}</p>
        <div class="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-700/50 my-4">
          <div>
            <span class="block text-xs text-slate-500 dark:text-slate-400">المشاريع</span>
            <span class="font-bold text-lg text-slate-800 dark:text-white">${user.public_repos}</span>
          </div>
          <div>
            <span class="block text-xs text-slate-500 dark:text-slate-400">المتابعون</span>
            <span class="font-bold text-lg text-slate-800 dark:text-white">${user.followers}</span>
          </div>
          <div>
            <span class="block text-xs text-slate-500 dark:text-slate-400">يطالع</span>
            <span class="font-bold text-lg text-slate-800 dark:text-white">${user.following}</span>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400 mt-4">
          <div class="flex items-center justify-center md:justify-start gap-2">
            <i class="fa-solid fa-location-dot text-slate-400 w-4"></i>
            <span>${user.location || 'غير محدد'}</span>
          </div>
          <div class="flex items-center justify-center md:justify-start gap-2">
            <i class="fa-solid fa-building text-slate-400 w-4"></i>
            <span>${user.company || 'غير محدد'}</span>
          </div>
          <div class="flex items-center justify-center md:justify-start gap-2">
            <i class="fa-solid fa-link text-slate-400 w-4"></i>
            ${user.blog ? `<a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank" class="hover:text-sky-500 truncate">${user.blog}</a>` : 'غير محدد'}
          </div>
          <div class="flex items-center justify-center md:justify-start gap-2">
            <i class="fa-brands fa-twitter text-slate-400 w-4"></i>
            <span>${user.twitter_username ? `@${user.twitter_username}` : 'غير محدد'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function displayRepos(repos) {
  if (!repos || repos.length === 0) {
    reposContainer.innerHTML = `
      <p class="col-span-2 text-slate-500 dark:text-slate-400 text-center py-4">لا توجد مشاريع عامة لعرضها.</p>
    `;
    return;
  }

  reposContainer.innerHTML = repos.map(repo => `
    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
      <div>
        <a href="${repo.html_url}" target="_blank" class="font-bold text-sky-500 dark:text-sky-400 hover:underline text-lg block mb-1">
          ${repo.name}
        </a>
        <p class="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">${repo.description || 'لا يوجد وصف للمشروع.'}</p>
      </div>
      <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-3">
        ${repo.language ? `<span class="flex items-center gap-1"><i class="fa-solid fa-circle text-[8px] text-sky-500"></i> ${repo.language}</span>` : ''}
        <span class="flex items-center gap-1"><i class="fa-regular fa-star text-amber-400"></i> ${repo.stargazers_count}</span>
        <span class="flex items-center gap-1"><i class="fa-solid fa-code-fork"></i> ${repo.forks_count}</span>
      </div>
    </div>
  `).join('');
}

function showLoading() {
  loading.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  contentContainer.classList.add('hidden');
}

function showContent() {
  loading.classList.add('hidden');
  errorMessage.classList.add('hidden');
  contentContainer.classList.remove('hidden');
}

function showError(msg) {
  loading.classList.add('hidden');
  contentContainer.classList.add('hidden');
  errorText.innerText = msg;
  errorMessage.classList.remove('hidden');
}