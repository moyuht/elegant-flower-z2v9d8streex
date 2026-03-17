import React, { useState, useEffect } from 'react';
import { 
  Flame, Plus, Trash2, CheckCircle2, Circle, 
  Activity, Trophy, XCircle, CalendarDays, Target 
} from 'lucide-react';

export default function App() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habit_tracker_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'شرب 2 لتر ماء', streak: 5, lastCompleted: getYesterday(), color: 'bg-blue-500' },
      { id: 2, name: 'قراءة 10 صفحات', streak: 0, lastCompleted: null, color: 'bg-purple-500' },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-indigo-500');

  const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];

  // استخدام التوقيت المحلي الدقيق بدلاً من التوقيت العالمي (UTC)
  function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA');
  }

  const getToday = () => new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    localStorage.setItem('habit_tracker_data', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    const today = getToday();
    setHabits(prev => prev.map(habit => {
      if (!habit.lastCompleted) return habit;
      
      const lastDate = new Date(habit.lastCompleted);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        return { ...habit, streak: 0 };
      }
      return habit;
    }));
  }, []);

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    // تحديث آمن للحالة باستخدام prev
    setHabits(prev => [...prev, {
      id: Date.now(),
      name: newHabitName,
      streak: 0,
      lastCompleted: null,
      color: selectedColor
    }]);
    setNewHabitName('');
    setIsModalOpen(false);
  };

  const deleteHabit = (id) => {
    if(window.confirm('هل أنت متأكد من حذف هذه العادة؟ سيتلاشى كل تقدمك!')) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const toggleHabitToday = (habit) => {
    const today = getToday();
    const isDoneToday = habit.lastCompleted === today;

    setHabits(prev => prev.map(h => {
      if (h.id === habit.id) {
        if (isDoneToday) {
          return { 
            ...h, 
            streak: Math.max(0, h.streak - 1), 
            lastCompleted: h.streak > 1 ? getYesterday() : null 
          };
        } else {
          const lastDate = h.lastCompleted ? new Date(h.lastCompleted) : null;
          const currentDate = new Date(today);
          const diffDays = lastDate ? Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24)) : null;

          let newStreak = h.streak;
          if (diffDays === 1 || !lastDate) {
            newStreak += 1; 
          } else if (diffDays > 1) {
            newStreak = 1; 
          }

          return { ...h, streak: newStreak, lastCompleted: today };
        }
      }
      return h;
    }));
  };

  const getBadge = (streak) => {
    if (streak >= 100) return { icon: '👑', label: 'أسطورة', color: 'text-yellow-400' };
    if (streak >= 30) return { icon: '🏆', label: 'ذهبية', color: 'text-yellow-500' };
    if (streak >= 14) return { icon: '🥈', label: 'فضية', color: 'text-slate-300' };
    if (streak >= 7) return { icon: '🥉', label: 'برونزية', color: 'text-amber-600' };
    return null;
  };

  const totalActiveHabits = habits.length;
  const completedToday = habits.filter(h => h.lastCompleted === getToday()).length;
  const longestStreak = Math.max(...habits.map(h => h.streak), 0);
  
  // حساب نسبة التقدم اليومي
  const progressPercentage = totalActiveHabits === 0 ? 0 : Math.round((completedToday / totalActiveHabits) * 100);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 sm:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-lg shadow-orange-500/30">
              <Flame className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">متتبع العادات V3</h1>
              <p className="text-slate-400 text-sm mt-1">ابنِ عاداتك اليومية ولا تكسر السلسلة أبداً! 🔥</p>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} />
            إضافة عادة
          </button>
        </header>

        {/* شريط التقدم اليومي (Progress Bar) الجديد */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                <Target size={18} className="text-blue-400" />
                إنجازاتك اليوم
              </h3>
              <p className="text-slate-400 text-sm mt-1">أنجزت {completedToday} من أصل {totalActiveHabits} عادات</p>
            </div>
            <span className="text-2xl font-black text-blue-400">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-700 overflow-hidden relative">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-4 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="w-full h-full opacity-30 bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] animate-[moveBg_1s_linear_infinite]"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-xl"><CheckCircle2 className="text-green-500" size={24}/></div>
            <div>
              <p className="text-slate-400 text-sm">العادات المنجزة</p>
              <p className="text-2xl font-black text-white">{completedToday} / {totalActiveHabits}</p>
            </div>
          </div>
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center gap-4 relative overflow-hidden group">
            <div className="bg-orange-500/10 p-3 rounded-xl relative z-10 group-hover:scale-110 transition-transform"><Trophy className="text-orange-500" size={24}/></div>
            <div className="relative z-10">
              <p className="text-slate-400 text-sm">أعلى سلسلة (Streak)</p>
              <p className="text-2xl font-black text-orange-500">{longestStreak} 🔥</p>
            </div>
            {longestStreak > 0 && <div className="absolute inset-0 bg-gradient-to-l from-orange-500/5 to-transparent"></div>}
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          {habits.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center flex flex-col items-center">
              <CalendarDays size={64} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">لا يوجد عادات بعد</h3>
              <p className="text-slate-400">ابدأ بإضافة أول عادة تود الالتزام بها.</p>
            </div>
          ) : (
            habits.map(habit => {
              const isDoneToday = habit.lastCompleted === getToday();
              const badge = getBadge(habit.streak);
              
              return (
                <div 
                  key={habit.id} 
                  className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 flex items-center justify-between gap-4
                    ${isDoneToday ? 'bg-slate-800/80 border-slate-700 scale-[0.99] opacity-90' : 'bg-slate-800 border-slate-600 hover:border-slate-500'}`}
                >
                  <div className={`absolute top-0 right-0 w-2 h-full ${habit.color} opacity-80`}></div>

                  <div className="flex items-center gap-4 pr-3 flex-1">
                    <button 
                      onClick={() => toggleHabitToday(habit)}
                      className={`shrink-0 transition-all duration-300 active:scale-75 ${isDoneToday ? 'rotate-[360deg]' : ''}`}
                    >
                      {isDoneToday ? (
                        <CheckCircle2 size={36} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      ) : (
                        <Circle size={36} className="text-slate-500 hover:text-slate-300" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xl font-bold transition-colors ${isDoneToday ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {habit.name}
                        </h3>
                        {badge && (
                          <span className={`text-sm bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1 ${badge.color} animate-bounce-slight`}>
                            {badge.icon} {badge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mt-0.5">
                        {isDoneToday ? 'رائع! حافظ على هذه القوة غداً.' : 'انقر على الدائرة لإنجاز العادة!'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 flex flex-col items-center min-w-[80px] relative overflow-hidden group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">السلسلة</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-2xl font-black font-mono ${habit.streak > 0 ? 'text-orange-500' : 'text-slate-500'}`}>
                          {habit.streak}
                        </span>
                        <Flame size={18} className={`${habit.streak > 0 ? 'text-orange-500 animate-fire' : 'text-slate-600'}`} />
                      </div>
                      {isDoneToday && <div className="absolute inset-0 bg-orange-500/5 animate-pulse"></div>}
                    </div>

                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="حذف العادة"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="text-indigo-400"/> عادة جديدة
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={addHabit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-bold">ما هي العادة التي تريد الالتزام بها؟</label>
                <input 
                  required autoFocus type="text" value={newHabitName} placeholder="مثال: ممارسة الرياضة 20 دقيقة"
                  onChange={e => setNewHabitName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-slate-400 font-bold">اختر لوناً للعادة:</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full ${color} transition-transform ${selectedColor === color ? 'ring-4 ring-white/20 scale-110 shadow-lg' : 'hover:scale-110'}`}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-600/20 mt-4">
                بدء التحدي 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* إضافة الأوامر الحركية (CSS Animations) الجديدة */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }

        @keyframes fireGrow {
          0% { transform: scale(1) rotate(-5deg); filter: brightness(1); }
          50% { transform: scale(1.3) rotate(5deg); filter: brightness(1.3); }
          100% { transform: scale(1) rotate(-5deg); filter: brightness(1); }
        }
        .animate-fire { animation: fireGrow 1.5s ease-in-out infinite; transform-origin: bottom center; }

        @keyframes bounceSlight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-slight { animation: bounceSlight 2s infinite ease-in-out; }

        @keyframes moveBg {
          0% { background-position: 0 0; }
          100% { background-position: 1rem 0; }
        }
      `}} />
    </div>
  );
}

