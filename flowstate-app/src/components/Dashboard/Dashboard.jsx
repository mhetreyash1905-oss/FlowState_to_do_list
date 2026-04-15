import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLog';
import './Dashboard.css';

// ─── helpers ────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }
function weekKey()  { const d = new Date(); const jan1 = new Date(d.getFullYear(),0,1); return `${d.getFullYear()}-W${Math.ceil(((d - jan1)/86400000 + jan1.getDay()+1)/7)}`; }
function monthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }

function loadLS(key, fb) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }
  catch { return fb; }
}
function saveLS(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function nextId(arr) { return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1; }

function resetItems(items, periodKey) {
  const key = periodKey();
  const anyDone = items.some(i => i.completed && i.completedPeriod === key);
  if (anyDone) return items;
  return items.map(i => ({ ...i, completed: false, completedPeriod: null }));
}

function stripeClass(score) {
  if (score >= 3) return 'stripe-excellent';
  if (score >= 1) return 'stripe-good';
  if (score >= -1) return 'stripe-ok';
  if (score >= -3) return 'stripe-weak';
  return 'stripe-critical';
}

const COLORS = ['#ff6b35','#ff9800','#ffd740','#00e5ff','#7c5cfc','#00ffb3','#ff6f91','#40c4ff'];

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

// ─── Seed data ──────────────────────────────────────────
const SEED = {
  habits: [{ id:1, title:'Progress was made!', score:2 }],
  daily: [
    { id:1, title:'Breakfast',       completed:false, completedPeriod:null, streak:0, color:'#ff6b35' },
    { id:2, title:'Lunch',           completed:false, completedPeriod:null, streak:0, color:'#ff9800' },
    { id:3, title:'Dinner',          completed:false, completedPeriod:null, streak:0, color:'#ffd740' },
    { id:4, title:'Workout',         completed:false, completedPeriod:null, streak:0, color:'#00e5ff' },
    { id:5, title:'Study',           completed:false, completedPeriod:null, streak:0, color:'#7c5cfc' },
    { id:6, title:'Code',            completed:false, completedPeriod:null, streak:0, color:'#00ffb3' },
    { id:7, title:'Work on project', completed:false, completedPeriod:null, streak:0, color:'#ff6f91' },
  ],
  weekly: [
    { id:1, title:'Deep clean the room',      completed:false, completedPeriod:null, streak:0, color:'#40c4ff' },
    { id:2, title:'Grocery shopping',          completed:false, completedPeriod:null, streak:0, color:'#ff6b35' },
    { id:3, title:'Review weekly goals',       completed:false, completedPeriod:null, streak:0, color:'#ffd740' },
    { id:4, title:'Call family',               completed:false, completedPeriod:null, streak:0, color:'#00ffb3' },
    { id:5, title:'Plan next week',            completed:false, completedPeriod:null, streak:0, color:'#7c5cfc' },
    { id:6, title:'One long workout session',  completed:false, completedPeriod:null, streak:0, color:'#ff6f91' },
  ],
  monthly: [
    { id:1, title:'Pay bills',            completed:false, completedPeriod:null, streak:0, color:'#ff9800' },
    { id:2, title:'Review finances',      completed:false, completedPeriod:null, streak:0, color:'#00e5ff' },
    { id:3, title:'Set monthly goals',    completed:false, completedPeriod:null, streak:0, color:'#7c5cfc' },
    { id:4, title:'Doctor check-up',      completed:false, completedPeriod:null, streak:0, color:'#ff6f91' },
    { id:5, title:'Read one book',        completed:false, completedPeriod:null, streak:0, color:'#00ffb3' },
    { id:6, title:'Learn new skill',      completed:false, completedPeriod:null, streak:0, color:'#40c4ff' },
  ],
  todos: [
    { id:1, title:'surface chemistry',        done:false, status:'active' },
    { id:2, title:'bond order calculation',   done:false, status:'active' },
    { id:3, title:'solid state',              done:false, status:'active' },
    { id:4, title:'EAN coordinate chemistry', done:false, status:'scheduled' },
    { id:5, title:'zener diode questions',    done:false, status:'active' },
  ],
};

// ─── AddRow ─────────────────────────────────────────────
function AddRow({ placeholder, onAdd }) {
  const [val, setVal] = useState('');
  const submit = () => { const t = val.trim(); if (t) { onAdd(t); setVal(''); } };
  return (
    <div className="col-panel__add-row">
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key==='Enter' && submit()} placeholder={placeholder} />
      <button className="col-panel__add-btn" onClick={submit} type="button">+ Add</button>
    </div>
  );
}

// ─── HABITS COLUMN ──────────────────────────────────────
function HabitsColumn({ habits, onPlus, onMinus, onDelete, onAdd }) {
  const [tab, setTab] = useState('all');
  const filtered = habits.filter(h => {
    if (tab==='weak')   return h.score < 0;
    if (tab==='strong') return h.score >= 2;
    return true;
  });
  return (
    <div className="col-panel" id="habits-panel">
      <div className="col-panel__head">
        <div className="col-panel__title-row">
          <span className="col-panel__title">Habits</span>
          <span className="col-panel__count">{habits.length}</span>
        </div>
        <div className="col-panel__tabs">
          {['all','weak','strong'].map(t => (
            <button key={t} className={`col-tab ${tab===t?'active':''}`}
              onClick={() => setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>
      </div>
      <AddRow placeholder="Add a Habit…" onAdd={onAdd} />
      <ul className="col-panel__list" role="list">
        {filtered.length===0 && (
          <li className="col-panel__empty"><span className="col-panel__empty-icon">🏅</span>
            {tab==='all' ? 'Add your first habit!' : `No ${tab} habits.`}
          </li>
        )}
        {filtered.map(h => (
          <li key={h.id} className="habit-card">
            <div className={`habit-card__stripe ${stripeClass(h.score)}`} />
            <button className="habit-card__plus" onClick={() => onPlus(h.id)} title="Positive">＋</button>
            <div className="habit-card__body">
              <div className="habit-card__title">{h.title}</div>
              <div className="habit-card__meta">
                <span>▶▶</span>
                <span className={`habit-card__score ${h.score>=0?'score-pos':'score-neg'}`}>
                  {h.score >= 0 ? `+${h.score}` : h.score}
                </span>
              </div>
            </div>
            <button className="habit-card__del" onClick={() => onDelete(h.id)}>✕</button>
            <button className="habit-card__minus" onClick={() => onMinus(h.id)} title="Negative">－</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── RECURRING COLUMN (Daily / Weekly / Monthly) ────────
function RecurringColumn({ label, icon, items, onToggle, onDelete, onAdd, periodLabel }) {
  const [tab, setTab] = useState('all');
  const filtered = items.filter(d => {
    if (tab==='due')    return !d.completed;
    if (tab==='notdue') return d.completed;
    return true;
  });
  return (
    <div className="col-panel">
      <div className="col-panel__head">
        <div className="col-panel__title-row">
          <span className="col-panel__title">{icon} {label}</span>
          <span className="col-panel__count">{items.length}</span>
          <span className="col-panel__period-badge">{periodLabel}</span>
        </div>
        <div className="col-panel__tabs">
          {[['all','All'],['due','Due'],['notdue','Done']].map(([v,l]) => (
            <button key={v} className={`col-tab ${tab===v?'active':''}`}
              onClick={() => setTab(v)}>{l}</button>
          ))}
        </div>
      </div>
      <AddRow placeholder={`Add a ${label.slice(0,-1)}…`} onAdd={onAdd} />
      <ul className="col-panel__list" role="list">
        {filtered.length===0 && (
          <li className="col-panel__empty"><span className="col-panel__empty-icon">📅</span>Nothing here.</li>
        )}
        {filtered.map(d => (
          <li key={d.id} className={`daily-item ${d.completed?'done':''}`} onClick={() => onToggle(d.id)}>
            <div className={`daily-item__block ${d.completed?'checked':''}`} style={{background:d.color}}>
              <div className="daily-check-sq"><CheckIcon /></div>
            </div>
            <div className="daily-item__body">
              <div className="daily-item__title">{d.title}</div>
              <div className="daily-item__streak"><span>🔥</span><span>{d.streak}</span></div>
            </div>
            <div className="daily-item__actions" onClick={e=>e.stopPropagation()}>
              <button className="daily-del" onClick={() => onDelete(d.id)}>✕</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── TO-DO COLUMN ───────────────────────────────────────
function TodoColumn({ todos, onToggle, onDelete, onAdd }) {
  const [tab, setTab] = useState('active');
  const filtered = todos.filter(t => {
    if (tab==='active')    return !t.done && t.status!=='scheduled';
    if (tab==='scheduled') return t.status==='scheduled';
    if (tab==='complete')  return t.done;
    return true;
  });
  return (
    <div className="col-panel" id="todos-panel">
      <div className="col-panel__head">
        <div className="col-panel__title-row">
          <span className="col-panel__title">To Do's</span>
          <span className="col-panel__count">{todos.filter(t=>!t.done).length}</span>
        </div>
        <div className="col-panel__tabs">
          {[['active','Active'],['scheduled','Scheduled'],['complete','Complete']].map(([v,l]) => (
            <button key={v} className={`col-tab ${tab===v?'active':''}`}
              onClick={() => setTab(v)}>{l}</button>
          ))}
        </div>
      </div>
      <AddRow placeholder="Add a To Do…" onAdd={onAdd} />
      <ul className="col-panel__list" role="list">
        {filtered.length===0 && (
          <li className="col-panel__empty"><span className="col-panel__empty-icon">✅</span>
            {tab==='complete' ? 'Nothing completed.' : 'All clear!'}
          </li>
        )}
        {filtered.map((t,idx) => (
          <li key={t.id} className={`todo-item2 ${t.done?'done':''}`} onClick={() => onToggle(t.id)}>
            <div className="todo-item2__block">
              <div className="todo-check-sq" style={{background:COLORS[idx%COLORS.length], border:`2px solid ${COLORS[idx%COLORS.length]}`}}>
                <CheckIcon />
              </div>
            </div>
            <div className="todo-item2__body"><div className="todo-item2__title">{t.title}</div></div>
            <div className="todo-item2__actions" onClick={e=>e.stopPropagation()}>
              <button className="todo-del2" onClick={() => onDelete(t.id)}>✕</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  // View switcher
  const [view, setView] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  // ── State ──
  const [habits, setHabits]   = useState(() => loadLS('fs_habits2', SEED.habits));
  const [daily, setDaily]     = useState(() => resetItems(loadLS('fs_daily3', SEED.daily), todayStr));
  const [weekly, setWeekly]   = useState(() => resetItems(loadLS('fs_weekly3', SEED.weekly), weekKey));
  const [monthly, setMonthly] = useState(() => resetItems(loadLS('fs_monthly3', SEED.monthly), monthKey));
  const [todos, setTodos]     = useState(() => loadLS('fs_todos2', SEED.todos));

  useEffect(() => saveLS('fs_habits2',  habits),  [habits]);
  useEffect(() => saveLS('fs_daily3',   daily),   [daily]);
  useEffect(() => saveLS('fs_weekly3',  weekly),  [weekly]);
  useEffect(() => saveLS('fs_monthly3', monthly), [monthly]);
  useEffect(() => saveLS('fs_todos2',   todos),   [todos]);

  // ── Habit handlers ──
  const addHabit = useCallback(title => {
    setHabits(h => [...h, { id:nextId(h), title, score:0 }]);
    logActivity('added', title, 'habit');
  }, []);
  const plusHabit = useCallback(id => {
    setHabits(h => h.map(i => {
      if (i.id!==id) return i;
      logActivity('plus', i.title, 'habit');
      return { ...i, score: i.score+1 };
    }));
  }, []);
  const minusHabit = useCallback(id => {
    setHabits(h => h.map(i => {
      if (i.id!==id) return i;
      logActivity('minus', i.title, 'habit');
      return { ...i, score: i.score-1 };
    }));
  }, []);
  const deleteHabit = useCallback(id => {
    setHabits(h => { const item = h.find(i=>i.id===id); if(item) logActivity('deleted',item.title,'habit'); return h.filter(i=>i.id!==id); });
  }, []);

  // ── Generic recurring handlers ──
  function makeRecurringHandlers(setter, category, periodKeyFn) {
    const add = (title) => {
      setter(arr => [...arr, { id:nextId(arr), title, completed:false, completedPeriod:null, streak:0, color:COLORS[arr.length%COLORS.length] }]);
      logActivity('added', title, category);
    };
    const toggle = (id) => {
      setter(arr => arr.map(i => {
        if (i.id!==id) return i;
        const completing = !i.completed;
        logActivity(completing ? 'completed' : 'unchecked', i.title, category);
        return {
          ...i,
          completed: completing,
          completedPeriod: completing ? periodKeyFn() : null,
          streak: completing ? i.streak+1 : Math.max(0, i.streak-1),
        };
      }));
    };
    const del = (id) => {
      setter(arr => { const item = arr.find(i=>i.id===id); if(item) logActivity('deleted',item.title,category); return arr.filter(i=>i.id!==id); });
    };
    return { add, toggle, del };
  }

  const dailyH   = makeRecurringHandlers(setDaily,   'daily',   todayStr);
  const weeklyH  = makeRecurringHandlers(setWeekly,  'weekly',  weekKey);
  const monthlyH = makeRecurringHandlers(setMonthly, 'monthly', monthKey);

  // ── Todo handlers ──
  const addTodo = useCallback(title => {
    setTodos(t => [...t, { id:nextId(t), title, done:false, status:'active' }]);
    logActivity('added', title, 'todo');
  }, []);
  const toggleTodo = useCallback(id => {
    setTodos(t => t.map(i => {
      if (i.id!==id) return i;
      logActivity(!i.done ? 'completed' : 'unchecked', i.title, 'todo');
      return { ...i, done: !i.done, status: !i.done ? 'complete' : 'active' };
    }));
  }, []);
  const deleteTodo = useCallback(id => {
    setTodos(t => { const item = t.find(i=>i.id===id); if(item) logActivity('deleted',item.title,'todo'); return t.filter(i=>i.id!==id); });
  }, []);

  // ── Greeting ──
  const hour = new Date().getHours();
  const greet = hour < 12 ? '☀️ Good morning' : hour < 17 ? '⚡ Good afternoon' : '🌙 Good evening';
  const name  = user ? `, ${user.firstName}` : '';
  const formattedDate = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Which recurring list is active
  const recurringList    = view === 'daily' ? daily : view === 'weekly' ? weekly : monthly;
  const recurringHandler = view === 'daily' ? dailyH : view === 'weekly' ? weeklyH : monthlyH;
  const recurringLabels  = { daily: { label:'Dailies', icon:'🌅', period:'Resets daily' },
                             weekly: { label:'Weeklies', icon:'📅', period:'Resets weekly' },
                             monthly: { label:'Monthlies', icon:'📆', period:'Resets monthly' } };

  return (
    <section className="dashboard" aria-label="FlowState Tracker">
      <div className="container-wide">
        {/* Top bar */}
        <div className="dashboard__topbar">
          <h1 className="dashboard__greeting">
            <span className="gradient-text">{greet}{name}</span> — Let's flow.
          </h1>
          <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap'}}>
            {/* View switcher */}
            <div className="tracker-switcher" id="tracker-switcher">
              {(['daily','weekly','monthly']).map(v => (
                <button key={v} className={`tracker-sw-btn ${view===v?'active':''}`}
                  onClick={() => setView(v)} id={`sw-${v}`}>
                  {v === 'daily' ? '🌅 Daily' : v === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
                </button>
              ))}
            </div>
            <span className="dashboard__date">{formattedDate}</span>
          </div>
        </div>

        {/* 3 columns */}
        <div className="dashboard__columns">
          <HabitsColumn habits={habits} onPlus={plusHabit} onMinus={minusHabit}
            onDelete={deleteHabit} onAdd={addHabit} />
          <RecurringColumn
            label={recurringLabels[view].label}
            icon={recurringLabels[view].icon}
            periodLabel={recurringLabels[view].period}
            items={recurringList}
            onToggle={recurringHandler.toggle}
            onDelete={recurringHandler.del}
            onAdd={recurringHandler.add}
          />
          <TodoColumn todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} onAdd={addTodo} />
        </div>
      </div>
    </section>
  );
}
