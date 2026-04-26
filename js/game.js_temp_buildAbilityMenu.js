function buildAbilityMenu() {
  const actor = G.party[G.activeMemberIdx] || G.hero;
  if (!actor) return;
  const menu = document.getElementById('ability-sub');
  if (!menu) return;
  menu.innerHTML = '';

  actor.abilities.forEach(ab => {
    const icon = ab.icon || '';
    const type = ab.type || 'physical';
    
    const mpCost = Math.ceil(ab.mp * PassiveSystem.val(actor, 'MP_COST_MULT', 1.0));
    const canAfford = actor.mp >= mpCost;
    const cdLeft = (actor.cooldowns || {})[ab.id] || 0;
    const onCD = cdLeft > 0;
    const disabled = !canAfford || onCD;

    const row = document.createElement('div');
    row.className = 'ab-row';

    const b = document.createElement('button');
    b.className = `cmd-btn ability-btn ab-type-${type}${disabled ? ' disabled' : ''}`;
    b.disabled = disabled;

    const cdBadge = onCD
      ? `<span class="ab-cd-badge">⏳ ${cdLeft}t</span>`
      : '';

    b.innerHTML = `
      <span class="ab-icon">${icon}</span>
      <div class="ab-content">
        <span class="ab-name">${ab.name}</span>
        <span class="ab-meta">${mpCost} MP</span>
      </div>
      ${cdBadge}
    `;
    b.onclick = () => heroAbility(ab);
    b.onmouseenter = () => BattleUI.showAbilityDesc(ab);
    b.onfocus = () => BattleUI.showAbilityDesc(ab);

    const eye = document.createElement('span');
    eye.className = 'ab-info-eye';
    eye.textContent = '👁️';
    eye.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      BattleUI.showAbilityDesc(ab);
    }, true); 

    row.appendChild(b);
    row.appendChild(eye);
    menu.appendChild(row);
  });

  const back = document.createElement('button');
  back.className = 'cmd-btn dim';
  back.textContent = '← BACK';
  back.onclick = () => BattleUI.openSub(null);
  menu.appendChild(back);
}
