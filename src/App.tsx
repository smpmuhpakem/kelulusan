/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { Search, GraduationCap, MapPin, Calendar, CheckCircle2, XCircle, AlertCircle, RefreshCcw, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';
import SchoolLogo from './components/SchoolLogo';

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Interfaces
interface Student {
  nisn: string;
  nama: string;
  alamat: string;
  tanggal_lahir: string;
  status: string;
  skl?: string;
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  
  // Clean up the string (sometimes there are leading/trailing spaces or quotes)
  const cleanStr = dateStr.trim().replace(/^"|"$/g, '');
  
  let date: Date = new Date(cleanStr);
  
  // If parsing failed or gave a very old/future date, try manual parsing for DD/MM/YYYY or YYYY-MM-DD
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
    const parts = cleanStr.split(/[-/.]/); // Handle -, /, or . separators
    if (parts.length === 3) {
      // Check if YYYY-MM-DD
      if (parts[0].length === 4) {
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } 
      // Check if DD-MM-YYYY
      else if (parts[2].length === 4) {
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      // Check if MM-DD-YYYY (less common but possible)
      else if (parts[2].length === 4 && parseInt(parts[0]) <= 12) {
         // This is ambiguous with DD-MM-YYYY, usually Indonesian sheets use DD/MM
         // We'll stick to DD-MM as preference
      }
    }
  }

  if (isNaN(date.getTime())) return dateStr; // Fallback to raw string if still no luck

  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

const generateSKL = (student: Student) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // --- 1. KOP SURAT (Header) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MAJELIS PENDIDIKAN DASAR DAN MENENGAH", 105, 18, { align: "center" });
  doc.text("PIMPINAN CABANG MUHAMMADIYAH PAKEM", 105, 23, { align: "center" });
  doc.setFontSize(15);
  doc.text("SMP MUHAMMADIYAH PAKEM", 105, 29, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Terakreditasi B - Alamat: Jl. Kaliurang Km. 17, Pakem, Sleman, Yogyakarta 55582", 105, 34, { align: "center" });
  doc.text("Telepon: (0274) 895171 | Email: smpmuhpakem@gmail.com", 105, 38, { align: "center" });

  // Double line below Kop Surat
  doc.setLineWidth(0.8);
  doc.line(15, 41, 195, 41);
  doc.setLineWidth(0.2);
  doc.line(15, 42.5, 195, 42.5);

  // --- 2. SURAT KETERANGAN LULUS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SURAT KETERANGAN LULUS", 105, 54, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const currentYear = new Date().getFullYear();
  doc.text(`Nomor: 421/SKL-SMPMP/${currentYear}`, 105, 59, { align: "center" });

  // --- 3. PARAGRAPH PENGANTAR ---
  doc.setFontSize(10.5);
  doc.text("Yang bertanda tangan di bawah ini, Kepala Sekolah Menengah Pertama Muhammadiyah Pakem,", 15, 71);
  doc.text("Kabupaten Sleman, Provinsi Daerah Istimewa Yogyakarta menerangkan bahwa siswa:", 15, 76);

  // --- 4. DATA SISWA ---
  let yPos = 87;
  const labels = ["Nama Lengkap", "Nomor Induk Siswa Nasional (NISN)", "Tempat/Tanggal Lahir", "Alamat Domisili"];
  const values = [
    student.nama.toUpperCase(),
    student.nisn,
    formatDate(student.tanggal_lahir),
    student.alamat || "-"
  ];

  for (let i = 0; i < labels.length; i++) {
    doc.setFont("helvetica", "bold");
    doc.text(labels[i], 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(":", 88, yPos);
    
    // Support multi-line value for address
    if (labels[i] === "Alamat Domisili") {
      const splitAddress = doc.splitTextToSize(values[i], 100);
      doc.text(splitAddress, 92, yPos);
      yPos += (splitAddress.length * 5) + 3;
    } else {
      doc.text(values[i], 92, yPos);
      yPos += 8;
    }
  }

  // --- 5. PERNYATAAN STATUS ---
  yPos += 3;
  doc.setFont("helvetica", "normal");
  doc.text("Berdasarkan hasil Rapat Pleno Dewan Pendidik tentang Penentuan Kelulusan", 15, yPos);
  doc.text(`Tahun Pelajaran 2025/${currentYear}, yang bersangkutan dinyatakan:`, 15, yPos + 5);

  yPos += 14;
  
  // Status Box
  const statusStr = student.status.toUpperCase().includes("LULUS") ? "L U L U S" : "TIDAK LULUS";
  const isLulus = student.status.toLowerCase().includes("lulus");
  
  // Draw status badge in PDF
  doc.setFillColor(isLulus ? 245 : 254, isLulus ? 240 : 242, isLulus ? 220 : 242);
  doc.roundedRect(60, yPos - 6, 90, 12, 1, 1, 'F');
  
  doc.setDrawColor(isLulus ? 197 : 239, isLulus ? 160 : 68, isLulus ? 89 : 68);
  doc.setLineWidth(0.4);
  doc.roundedRect(60, yPos - 6, 90, 12, 1, 1, 'D');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(isLulus ? 130 : 220, isLulus ? 95 : 30, isLulus ? 20 : 30);
  doc.text(statusStr, 105, yPos + 1.5, { align: "center" });
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);

  // --- 6. PENUTUP ---
  yPos += 14;
  doc.setFont("helvetica", "normal");
  doc.text("Surat Keterangan Lulus ini diterbitkan secara sah dan resmi sebagai bukti sementara", 15, yPos);
  doc.text("sebelum ijazah asli diterbitkan oleh dinas terkait.", 15, yPos + 5);

  // --- 7. TANDA TANGAN (Sign-off) ---
  yPos += 22;
  doc.text("Pakem, 5 Mei 2026", 140, yPos);
  doc.text("Kepala Sekolah,", 140, yPos + 5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text("[ Tanda Tangan & Stempel Resmi ]", 140, yPos + 17);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text("SMP MUHAMMADIYAH PAKEM", 140, yPos + 28);

  // --- 8. FOOTER SECURE ---
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  const secureCode = `SECURE-ID: ${student.nisn}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  doc.text(secureCode, 15, 280);
  doc.text("Diverifikasi secara sistem oleh Portal Digital Kelulusan SMP MUH PAKEM", 15, 283);

  // Save the PDF
  doc.save(`SKL_${student.nisn}_${student.nama.replace(/\s+/g, '_')}.pdf`);
};

const DATA_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYOz5P2Rx92eZlLrXd5tAtzSlrfSF_VRR1Bc8kiOix3nIHUg_nqRC-I9ezDdQQWneXmY1Bz8k9gIkF/pub?gid=1701218407&single=true&output=csv";

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [nisnInput, setNisnInput] = useState('');
  const [searchResult, setSearchResult] = useState<Student | null | undefined>(undefined); // undefined = not searched, null = not found
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        Papa.parse(DATA_URL, {
          download: true,
          header: true,
          complete: (results) => {
            // Map the results to handle potential header mismatches
            // We look for headers case-insensitively
            const mappedData: Student[] = (results.data as any[]).map((row: any) => {
              const findKey = (keys: string[]) => {
                const rowKeys = Object.keys(row);
                const found = rowKeys.find(rk => keys.some(k => rk.toLowerCase().includes(k.toLowerCase())));
                return found ? row[found] : '';
              };

              return {
                nisn: findKey(['nisn']),
                nama: findKey(['nama', 'name']),
                alamat: findKey(['alamat', 'address']),
                tanggal_lahir: findKey(['tanggal', 'lahir', 'birth']),
                status: findKey(['status', 'keadaan', 'lulus']),
                skl: findKey(['skl', 'link skl', 'download skl', 'url skl']),
              };
            });
            
            // Filter out empty rows
            const cleanData = mappedData.filter(s => s.nisn && s.nama);
            setStudents(cleanData);
            setLoading(false);
          },
          error: (err) => {
            console.error('CSV Parsing Error:', err);
            setError("Gagal memuat data. Periksa koneksi internet Anda.");
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Fetch Error:', err);
        setError("Gagal menghubungi server data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nisnInput) return;

    setSearching(true);
    
    // Simulate brief search delay for "spectacular" feel
    setTimeout(() => {
      const found = students.find(s => s.nisn.trim() === nisnInput.trim());
      setSearchResult(found || null);
      setSearching(false);

      if (found && found.status.toLowerCase().includes('lulus')) {
        triggerConfetti();
      }
    }, 800);
  }, [nisnInput, students]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const resetSearch = () => {
    setSearchResult(undefined);
    setNisnInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-2 border-gold-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 w-20 h-20 border-t-2 border-gold-500 rounded-full animate-spin" />
          </div>
          <p className="text-gold-200/60 font-light tracking-[0.3em] uppercase text-[10px]">Menyiapkan Pengumuman...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#080808] text-white/90 font-sans selection:bg-gold-500/30 overflow-x-hidden flex flex-col">
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] contrast-150 grayscale" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-dark.png")' }} />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold-900/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[140px]" />
      </div>

      <nav className="relative z-10 px-8 pt-8 pb-4 md:pt-12 md:pb-8 flex flex-col items-center justify-center max-w-7xl mx-auto border-b border-white/5 gap-4">
        <SchoolLogo className="w-24 h-24 md:w-32 md:h-32 transition-all duration-500 hover:rotate-6 hover:scale-[1.03] select-none filter drop-shadow-[0_0_15px_rgba(254,226,30,0.15)]" />
        <div className="flex items-center">
          <span className="font-serif italic font-bold text-lg md:text-3xl tracking-tight gold-gradient-text">SMP Muh Pakem</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 flex-1 flex flex-col justify-center py-2 md:py-20">
        <AnimatePresence mode="wait">
          {searchResult === undefined ? (
            <motion.div
              key="search-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="mb-4 md:mb-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-3 py-0.5 border border-gold-500/20 rounded-full mb-3 md:mb-8 bg-gold-500/5"
                >
                  <span className="text-[8px] md:text-[10px] font-bold tracking-[0.3em] text-gold-400 uppercase">Announcement 2026</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-5xl md:text-7xl font-serif font-bold tracking-tight mb-2 md:mb-8 leading-tight"
                >
                  Gerbang Masa Depan <br />
                  <span className="gold-gradient-text italic">Dimulai Dari Sini</span>
                </motion.h1>
                <motion.p 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="text-white/30 max-w-xl mx-auto text-xs md:text-lg font-light leading-relaxed px-6"
                >
                  Masukkan NISN untuk mengakses pengumuman resmi kelulusan SMP Muhammadiyah Pakem.
                </motion.p>
              </div>

              <motion.form 
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative max-w-lg mx-auto"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gold-500/5 blur-xl group-focus-within:bg-gold-500/10 transition-all" />
                  <input
                    type="text"
                    placeholder="Masukkan NISN..."
                    value={nisnInput}
                    onChange={(e) => setNisnInput(e.target.value)}
                    className="relative w-full bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl px-6 py-3.5 md:py-6 md:pl-16 text-base md:text-xl outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all font-light tracking-widest placeholder:text-white/10 text-center md:text-left"
                  />
                  <Search className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gold-600/40 group-focus-within:text-gold-500 transition-colors" />
                </div>
                
                <button
                  type="submit"
                  disabled={searching || !nisnInput}
                  className="mt-4 md:mt-8 w-full group overflow-hidden relative bg-gold-500 py-4 md:py-6 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer shadow-lg shadow-gold-900/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-gold-950 font-bold tracking-[0.2em] text-[10px] md:text-sm uppercase">
                    {searching ? "Memverifikasi..." : "Akses Pengumuman"}
                  </span>
                  {!searching && <GraduationCap className="relative z-10 w-4 h-4 md:w-5 md:h-5 text-gold-950" />}
                </button>
              </motion.form>

              {error && (
                <div className="mt-10 text-red-400 font-light flex items-center justify-center gap-2 text-xs border border-red-400/20 bg-red-400/5 py-4 px-6 rounded-xl max-w-sm mx-auto">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result-view"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {searchResult ? (
                <div className="glass-card rounded-[3rem] overflow-hidden shadow-2xl relative">
                  {/* Elegant Border Effect */}
                  <div className="absolute inset-0 border border-gold-500/10 rounded-[3rem] pointer-events-none" />
                  
                  <div className="p-3 md:p-16">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-12 text-center lg:text-left">
                      <div className="space-y-4 md:space-y-10 flex-1">
                        <div>
                          <div className="flex items-center justify-center lg:justify-start gap-3 mb-1 md:mb-4">
                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-gold-500 rounded-full" />
                            <label className="text-[7px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-gold-400/60">Official Certificate</label>
                          </div>
                          <h2 className="text-xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
                            {searchResult.nama.toUpperCase()}
                          </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-10">
                          <div className="group">
                            <p className="text-[7px] md:text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-0.5 md:mb-3 group-hover:text-gold-400 transition-colors">Resident Address</p>
                            <div className="flex flex-col lg:flex-row lg:items-start gap-1 md:gap-4 justify-center lg:justify-start">
                              <div className="hidden lg:block w-px h-10 bg-gold-500/20 group-hover:bg-gold-500/50 transition-colors mt-1" />
                              <p className="text-xs md:text-lg font-light text-white/70 italic leading-relaxed line-clamp-2 md:line-clamp-none">{searchResult.alamat || '-'}</p>
                            </div>
                          </div>
                          <div className="group">
                            <p className="text-[7px] md:text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-0.5 md:mb-3 group-hover:text-gold-400 transition-colors">Date of Birth</p>
                            <div className="flex flex-col lg:flex-row lg:items-start gap-1 md:gap-4 justify-center lg:justify-start">
                              <div className="hidden lg:block w-px h-10 bg-gold-500/20 group-hover:bg-gold-500/50 transition-colors mt-1" />
                              <p className="text-xs md:text-lg font-light text-white/70 italic">{formatDate(searchResult.tanggal_lahir)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 md:pt-10 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8">
                          <div>
                            <p className="text-[8px] md:text-[9px] uppercase font-bold text-white/20 tracking-[0.3em] mb-1">Standardized NISN</p>
                            <p className="font-mono text-gold-500 text-sm md:text-lg tracking-widest">{searchResult.nisn}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center w-full lg:w-auto lg:min-w-[320px] gap-3">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", delay: 0.4 }}
                          className={cn(
                            "w-full py-3 md:py-12 px-4 md:px-10 rounded-[1.2rem] md:rounded-[2rem] flex flex-col items-center justify-center text-center gap-2 md:gap-6 relative overflow-hidden",
                            searchResult.status.toLowerCase().includes('lulus') 
                              ? "bg-gold-500/5 border border-gold-500/10" 
                              : "bg-red-500/5 border border-red-500/10"
                          )}
                        >
                          {searchResult.status.toLowerCase().includes('lulus') ? (
                            <>
                              <div className="absolute inset-0 bg-gold-500/[0.02] animate-pulse" />
                              <div className="w-10 h-10 md:w-20 md:h-20 rounded-full border border-gold-500/20 flex items-center justify-center mb-0.5 md:mb-2">
                                <CheckCircle2 className="w-5 h-5 md:w-10 md:h-10 text-gold-500" />
                              </div>
                              <div className="space-y-0.5 md:space-y-2 relative z-10">
                                <p className="text-[7px] md:text-[10px] font-bold text-gold-400 uppercase tracking-[0.4em]">Statement of Status</p>
                                <h3 className="text-2xl sm:text-5xl md:text-6xl font-serif font-black text-gold-500 tracking-tighter">LULUS</h3>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 md:w-20 md:h-20 rounded-full border border-red-500/20 flex items-center justify-center mb-0.5 md:mb-2">
                                <XCircle className="w-5 h-5 md:w-10 md:h-10 text-red-500" />
                              </div>
                              <div className="space-y-0.5 md:space-y-2 relative z-10">
                                <p className="text-[7px] md:text-[10px] font-bold text-red-500/60 uppercase tracking-[0.4em]">Statement of Status</p>
                                <h3 className="text-xl sm:text-4xl md:text-5xl font-serif font-black text-red-500 tracking-tighter">TIDAK LULUS</h3>
                              </div>
                            </>
                          )}
                        </motion.div>

                        {/* Download SKL Button */}
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          onClick={() => {
                            if (!searchResult) return;
                            const link = searchResult.skl?.trim();
                            if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
                              window.open(link, '_blank', 'noopener,noreferrer');
                            } else {
                              generateSKL(searchResult);
                            }
                          }}
                          className={cn(
                            "w-full py-2.5 md:py-3.5 px-4 md:px-6 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer font-bold uppercase tracking-[0.15em] text-[10px] md:text-sm shadow-md",
                            searchResult.status.toLowerCase().includes('lulus')
                              ? "bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-gold-950 shadow-gold-900/10"
                              : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10 cursor-not-allowed"
                          )}
                          disabled={!searchResult.status.toLowerCase().includes('lulus')}
                        >
                          <Download className="w-4 h-4" />
                          <span>Unduh SKL</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border-t border-white/5 px-6 md:px-12 py-3 md:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-6">
                    <p className="text-[8px] md:text-[10px] text-white/20 tracking-widest uppercase text-center sm:text-left">
                      Dokumen ini diterbitkan oleh SMP MUH PAKEM.
                    </p>
                    <button 
                      onClick={resetSearch}
                      className="group flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-gold-400 hover:text-gold-200 transition-colors cursor-pointer"
                    >
                      <RefreshCcw className="w-3 h-3 md:w-4 md:h-4 group-hover:rotate-180 transition-transform duration-700" />
                      Pencarian
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-center space-y-6 md:space-y-10 relative overflow-hidden">
                   {/* Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-[80px]" />
                  
                  <div className="w-16 h-16 md:w-24 md:h-24 border border-red-500/20 rounded-full flex items-center justify-center mx-auto relative">
                    <Search className="w-6 h-6 md:w-8 md:h-8 text-red-500/60" />
                  </div>
                  <div className="space-y-4 md:space-y-6 relative z-10">
                    <h3 className="text-2xl md:text-5xl font-serif font-bold tracking-tight">Data Tidak Ditemukan</h3>
                    <p className="text-white/30 max-w-sm mx-auto font-light text-sm md:text-lg italic leading-relaxed px-4">
                      Kami tidak menemukan catatan dengan NISN <span className="text-white font-mono not-italic">{nisnInput}</span>. Silakan pastikan nomor yang Anda gunakan sudah benar.
                    </p>
                  </div>
                  <button 
                    onClick={resetSearch}
                    className="relative z-10 border border-white/10 hover:border-white/30 text-white/60 hover:text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl transition-all font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px] cursor-pointer"
                  >
                    Kembali Ke Pusat Cari
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-4 md:py-10 border-t border-white/5 text-center px-6">
        <div className="hidden md:flex justify-center gap-6 mb-6 opacity-20">
            <div className="w-1 h-1 bg-white rounded-full" />
            <div className="w-1 h-1 bg-white rounded-full" />
            <div className="w-1 h-1 bg-white rounded-full" />
        </div>
        <p className="text-white/10 text-[7px] md:text-[9px] tracking-[0.4em] font-medium uppercase leading-relaxed">
          &copy; 2026 &bull; SMP MUH PAKEM <br className="md:hidden" />
          <span className="hidden md:inline"> &bull; </span> AUTHENTICATED BY THE BOARD
        </p>
      </footer>
    </div>
  );
}
