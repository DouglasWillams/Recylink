// admin-login.js — versão final: robusta, segura, e compatível com bindings antigos
(() => {
  const SELF = 'admin-login.js-final';
  console.log(`${SELF}: carregado @ ${new Date().toISOString()}`);

  // Função para exibir mensagens no formulário
  function displayAdminMessage(msg, type = 'error') {
    const form = document.getElementById('admin-login-form');
    if (!form) {
      console.warn(`${SELF}: form não encontrado para exibir mensagem:`, msg);
      return;
    }
    let box = document.getElementById('admin-form-message');
    if (!box) {
      box = document.createElement('div');
      box.id = 'admin-form-message';
      form.prepend(box);
    }
    box.textContent = msg;
    box.style.color = type === 'success' ? '#10B981' : '#EF4444';
    box.style.fontWeight = '700';
    box.style.padding = '8px';
    setTimeout(() => { box.textContent = ''; }, 5000);
  }

  // Handler seguro: tenta vários métodos de localizar os inputs antes de usar .value
  async function safeHandleSubmit(e) {
    try {
      e && e.preventDefault && e.preventDefault();
    } catch (err) { /* ignore */ }

    const form = (e && e.currentTarget) || document.getElementById('admin-login-form');

    if (!form) {
      console.error(`${SELF}: form ausente no submit event.`);
      displayAdminMessage('Erro interno: formulário ausente.');
      return;
    }

    // 1) tentar buscar dentro do form
    let emailInput = form.querySelector('#admin-email');
    let passwordInput = form.querySelector('#admin-password');

    // 2) fallback para buscar no documento inteiro (caso o form seja diferente)
    if (!emailInput) emailInput = document.getElementById('admin-email');
    if (!passwordInput) passwordInput = document.getElementById('admin-password');

    // 3) Se ainda não existir, reportar e evitar exceção
    if (!emailInput) {
      console.error(`${SELF}: input #admin-email não encontrado. form.innerHTML preview:`, form.innerHTML ? form.innerHTML.slice(0,400) : '(no innerHTML)');
      displayAdminMessage('Erro: campo e-mail ausente. Atualize a página.', 'error');
      return;
    }
    if (!passwordInput) {
      console.error(`${SELF}: input #admin-password não encontrado.`);
      displayAdminMessage('Erro: campo senha ausente. Atualize a página.', 'error');
      return;
    }

    // Safe read of values
    const email = (emailInput.value || '').trim();
    const password = passwordInput.value || '';

    if (!email || !password) {
      displayAdminMessage('Preencha todos os campos.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]') || null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset._oldText = submitBtn.textContent || '';
      submitBtn.textContent = 'Entrando...';
    }

    try {
      const res = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let result = {};
      try { result = await res.json(); } catch (err) { /* ignore json parse error */ }

      if (!res.ok) {
        displayAdminMessage(result.message || 'Falha no login.', 'error');
        return;
      }

      displayAdminMessage(result.message || 'Login realizado!', 'success');
      if (result.token) localStorage.setItem('adminToken', result.token);
      if (result.user?.name) localStorage.setItem('adminName', result.user.name);
      if (result.user?.role) localStorage.setItem('adminRole', result.user.role);

      setTimeout(() => {
        window.location.href = result.redirectUrl || '/admin-dashboard';
      }, 700);

    } catch (err) {
      console.error(`${SELF}: erro de rede ou servidor`, err);
      displayAdminMessage('Servidor indisponível.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset._oldText || 'Entrar como Admin';
      }
    }
  }

  // 1) Expor globalmente para sobrepor handlers que possam referenciar esse nome
  window.handleAdminLoginSubmit = safeHandleSubmit;

  // 2) Anexar listener de forma segura (remove qualquer listener anterior)
  function attach() {
    const form = document.getElementById('admin-login-form');
    console.log(`${SELF}: attach() form =`, form);
    if (!form) return;
    form.removeEventListener('submit', safeHandleSubmit);
    // também remover se existir binding antigo com o nome global
    try { form.removeEventListener('submit', window.handleAdminLoginSubmit); } catch (e) { /* ignore */ }
    form.addEventListener('submit', safeHandleSubmit);
    console.log(`${SELF}: submit handler anexado/protegido.`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    setTimeout(attach, 20);
  }
})();
