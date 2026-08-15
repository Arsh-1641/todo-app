import React, { useState, useEffect } from 'react'
import { IoIosAddCircleOutline, IoIosMoon, IoIosSunny, IoMdCheckmarkCircle, IoMdClose, IoMdRadioButtonOff } from "react-icons/io";

const API_URL = '/api/todos';

const App = () => {
  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('todo-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Todos state
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('todo-theme', theme);
  }, [theme]);

  // Fetch todos from backend
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch todos');
        const data = await res.json();
        setTodos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Add a new todo
  const addTodo = async (e) => {
    e.preventDefault();
    const title = newTodo.trim();
    if (!title) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to add todo');
      const todo = await res.json();
      setTodos(prev => [todo, ...prev]);
      setNewTodo('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle todo completed status
  const toggleTodo = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      const updatedTodo = await res.json();
      setTodos(prev => prev.map(todo => todo._id === id ? updatedTodo : todo));
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete todo');
      setTodos(prev => prev.filter(todo => todo._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className='min-h-screen bg-slate-100 dark:bg-[#190E33] text-slate-800 dark:text-white transition-colors duration-300'>
      <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <header className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-3xl'>📝</span>
            <h1 className='text-2xl sm:text-3xl font-bold bg-linear-to-r from-amber-500 to-pink-500 dark:from-amber-400 dark:to-pink-400 bg-clip-text text-transparent'>
              My Todo List
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className='p-2 rounded-full bg-white dark:bg-white/10 shadow-sm ring-1 ring-slate-200 dark:ring-white/10 hover:scale-110 transition-transform'
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <IoIosSunny size={22} className='text-amber-400' /> : <IoIosMoon size={22} className='text-slate-700' />}
          </button>
        </header>

        {/* Error message */}
        {error && (
          <div className='bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm ring-1 ring-red-200 dark:ring-red-500/20'>
            {error}
          </div>
        )}

        {/* Input Card */}
        <form onSubmit={addTodo} className='flex gap-3 bg-white dark:bg-white/10 rounded-2xl p-3 shadow-lg ring-1 ring-slate-200 dark:ring-white/10'>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className='flex-1 bg-transparent outline-none px-3 py-2 placeholder-slate-400 dark:placeholder-slate-500'
            placeholder='What needs to be done?'
          />
          <button type="submit" className='text-amber-500 hover:text-amber-400 hover:scale-110 active:scale-95 transition-all' aria-label="Add todo">
            <IoIosAddCircleOutline size={40} />
          </button>
        </form>

        {/* Loading state */}
        {loading ? (
          <div className='flex flex-col items-center gap-2 bg-white dark:bg-white/5 rounded-2xl py-8 px-4 ring-1 ring-slate-200 dark:ring-white/10 text-center'>
            <span className='text-3xl animate-spin inline-block'>⏳</span>
            <p className='text-sm text-slate-500 dark:text-slate-400'>Loading todos...</p>
          </div>
        ) : (
          /* Two-column sections */
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

            {/* Pending Tasks */}
            <section className='flex flex-col gap-3'>
              <div className='flex items-center gap-2 px-1'>
                <span className='text-xl'>📋</span>
                <h2 className='text-lg sm:text-xl font-semibold'>Pending Tasks</h2>
                <span className='ml-auto text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'>
                  {pendingTodos.length}
                </span>
              </div>

              {pendingTodos.length === 0 ? (
                <div className='flex flex-col items-center gap-2 bg-white dark:bg-white/5 rounded-2xl py-8 px-4 ring-1 ring-slate-200 dark:ring-white/10 text-center'>
                  <span className='text-3xl'>🎉</span>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>All caught up! No pending tasks.</p>
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  {pendingTodos.map(todo => (
                    <div key={todo._id} className='flex items-center gap-3 bg-white dark:bg-white/10 rounded-xl px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:ring-white/10 hover:shadow-md transition-shadow'>
                      <button onClick={() => toggleTodo(todo._id, todo.completed)} className='shrink-0' aria-label={`Mark ${todo.title} as completed`}>
                        <IoMdRadioButtonOff className='text-slate-400 dark:text-slate-500 hover:text-green-500 transition-colors' size={20} />
                      </button>
                      <span className='flex-1 text-sm sm:text-base'>{todo.title}</span>
                      <button onClick={() => deleteTodo(todo._id)} className='text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors' aria-label={`Delete ${todo.title}`}>
                        <IoMdClose size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Completed Tasks */}
            <section className='flex flex-col gap-3'>
              <div className='flex items-center gap-2 px-1'>
                <span className='text-xl'>✅</span>
                <h2 className='text-lg sm:text-xl font-semibold'>Completed</h2>
                <span className='ml-auto text-sm font-semibold px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'>
                  {completedTodos.length}
                </span>
              </div>

              {completedTodos.length === 0 ? (
                <div className='flex flex-col items-center gap-2 bg-white dark:bg-white/5 rounded-2xl py-8 px-4 ring-1 ring-slate-200 dark:ring-white/10 text-center'>
                  <span className='text-3xl'>📝</span>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>No completed tasks yet. Keep going!</p>
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  {completedTodos.map(todo => (
                    <div key={todo._id} className='flex items-center gap-3 bg-white dark:bg-white/10 rounded-xl px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:ring-white/10 hover:shadow-md transition-shadow'>
                      <button onClick={() => toggleTodo(todo._id, todo.completed)} className='shrink-0' aria-label={`Mark ${todo.title} as pending`}>
                        <IoMdCheckmarkCircle className='text-green-500 hover:text-slate-400 transition-colors shrink-0' size={20} />
                      </button>
                      <span className='flex-1 text-sm sm:text-base line-through text-slate-400 dark:text-slate-500'>{todo.title}</span>
                      <button onClick={() => deleteTodo(todo._id)} className='text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors' aria-label={`Delete ${todo.title}`}>
                        <IoMdClose size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default App