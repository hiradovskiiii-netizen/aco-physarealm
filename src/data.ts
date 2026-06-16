import { CodeTemplate } from "./types";

export const GRASSHOPPER_TEMPLATES: CodeTemplate[] = [
  {
    id: "firefly_fft",
    title: "انتقال فوری از طریق Firefly FFT",
    description: "با استفاده از پلاگین محبوب Firefly در گرسهاپر، سیگنال صوتی سیستم یا میکروفون را مستقیماً دریافت کرده و فرکانس‌های بم، میانه و زیر را به ورودی‌های Physarealm متصل کنید.",
    setupType: "firefly",
    code: `# GhPython Script for Firefly Frequency Decomposition & Mapping
# This script processes real-time FFT bands from Firefly and outputs normalized parameters
# for Physarealm or custom ACO agent setups.

import math

# Inputs:
#   fft_data (List of numbers from Firefly Frequency Spectrum component)
#   bass_sens (float: multiplier for bass frequencies)
#   mid_sens (float: multiplier for mid frequencies)
#   high_sens (float: multiplier for high frequencies)
# Outputs:
#   step_size (SS)
#   sensor_angle (SA)
#   sensor_dist (SO)
#   pheromone_deposit (T)

# Standard thresholds for human hearing bands inside Firefly FFT (usually 0 - 511 bands)
# Bass bands: 1 - 20 (sub and kick frequencies)
# Mid bands: 40 - 150 (vocal, melody, synth chords)
# High bands: 200 - 450 (hi-hats, harmonics)

def map_value(val, in_min, in_max, out_min, out_max):
    # Safe mapping with clamping
    if in_max == in_min: return out_min
    clamped = max(in_min, min(in_max, val))
    return out_min + (float(clamped - in_min) / (in_max - in_min)) * (out_max - out_min)

if 'fft_data' in globals() and fft_data:
    # 1. Extract raw frequency amplitudes
    bass_amp = sum(fft_data[1:15]) / 14.0 if len(fft_data) > 15 else 0
    mid_amp = sum(fft_data[30:100]) / 70.0 if len(fft_data) > 100 else 0
    high_amp = sum(fft_data[180:350]) / 170.0 if len(fft_data) > 350 else 0
    
    # 2. Apply customized user sensitivities (sens)
    b_val = bass_amp * (bass_sens if 'bass_sens' in globals() else 1.5)
    m_val = mid_amp * (mid_sens if 'mid_sens' in globals() else 1.2)
    h_val = high_amp * (high_sens if 'high_sens' in globals() else 2.0)
    
    # 3. Scale and output variables based on biologically-coherent morph rules:
    # Heavy rhythm spikes (kick) drive Step Size (SS) for fast expansion when rhythm drops.
    step_size = map_value(b_val, 0.0, 10.0, 0.8, 4.5)
    
    # Mid-range melodic harmonics expand or restrict the agent's Pheromone trail strength.
    pheromone_deposit = map_value(m_val, 0.0, 8.0, 5.0, 25.0)
    
    # High-pitched rapid fluctuations control Sensor Angle (SA) and Sensor Distance (SO - Sensor Offset)
    # causing the mold to form detailed branch webs and search narrow/wide spaces.
    sensor_angle = map_value(h_val, 0.0, 5.0, 15.0, 65.0)  # in degrees
    sensor_dist = map_value(h_val, 0.0, 5.0, 4.0, 25.0)    # SO (offset distance)
else:
    # Safe Defaults if no audio is streaming
    step_size = 1.2
    sensor_angle = 45.0
    sensor_dist = 9.0
    pheromone_deposit = 12.0

# Print info status to Grasshopper Out window
print("Acoustic Slime Synced: SA={:.1f}deg, SS={:.2f}, SO={:.1f}, Dep={:.1f}".format(
    sensor_angle, step_size, sensor_dist, pheromone_deposit
))`
  },
  {
    id: "osc_udp",
    title: "دریافت بسته‌های OSC با gHowl / Mosquito",
    description: "بهترین الگو برای اتصال نرم‌افزارهای تخصصی صدا (مانند TouchDesigner, Max/MSP, Ableton Live) از طریق پروتکل UDP/OSC به پلاگین gHowl در گرسهاپر جهت اعمال ریتم زنده موسیقی بر هندسه.",
    setupType: "ghowl",
    code: `# GhPython Script receiving UDP/OSC audio parameters from external software (e.g. Ableton/TD)
# Inputs:
#   osc_address (str: Address matching "/audio/frequencies" or similar)
#   osc_arguments (list of values parsed from UDP Receiver of gHowl)
#   decay_base (float: general trail decay coefficient)
# Outputs:
#   SS (Step Size)
#   SA (Sensor Angle in degrees)
#   T (Deposit amount)
#   D (Trail Decay Rate)

import math

def process_osc_signals(args):
    # We expect arguments to contains: [Bass_amplitude, Mid_amplitude, High_amplitude, Harmonic_ratio]
    if not args or len(args) < 3:
        return 1.0, 30.0, 10.0, 0.1
        
    bass = float(args[0])
    mids = float(args[1])
    highs = float(args[2])
    
    # Parameter 1: SS (Step Size) - Driven by rhythmic Bass beat
    ss_out = 1.0 + (bass * 2.8) # Increases speed up to 3.8x
    
    # Parameter 2: SA (Sensor Angle) - Sways with high frequencies
    sa_out = 22.5 + (highs * 45.0) # Saws between 22.5 and 67.5 degrees
    
    # Parameter 3: T (Pheromone Deposit) - Connected to Mids volume
    t_out = 8.0 + (mids * 18.0)
    
    # Parameter 4: D (Pheromone Decay Rate) - Higher mids/highs prevent rapid fading
    # High density structures build under active music, fades quickly in silent moments
    decay_out = max(0.04, min(0.35, 0.25 - (bass * 0.15)))
    
    return ss_out, sa_out, t_out, decay_out

if 'osc_arguments' in globals() and osc_arguments:
    SS, SA, T, D = process_osc_signals(osc_arguments)
else:
    # Off-air baseline architecture values
    SS = 1.2
    SA = 35.0
    T = 12.0
    D = 0.12

print("OSC Acoustic Signal Received: Speed={:.2f}, Vision={:.1f}deg, Trail={:.1f}, DecayRate={:.3f}".format(SS, SA, T, D))`
  },
  {
    id: "raw_wav_analyzer",
    title: "کد پایتون مستقل گرسهاپر (بدون نیاز به پلاگین خارجی)",
    description: "اگر نمی‌خواهید از هیچ پلاگین صوتی استفاده کنید، این کد با خواندن مقادیر عددی ذخیره شده از آنالیز فرکانس‌های آهنگ (فایل متنی CSV یا متادیتا) مستقیماً پارامترها را بارگذاری می‌کند.",
    setupType: "python_udp",
    code: `# GhPython Independent File-Based Sound Curve Sync
# This Python component reads a pre-baked sound analysis TXT or CSV file
# containing structural rhythm parameters column-by-column. Avoids using extra plugins!

import os

# Inputs:
#   file_path (string: absolute path of the generated .txt sound curves)
#   rhino_timeline_frame (int: connects to standard GH 'slider' or 'trigger' to read frame by frame)
# Outputs:
#   SS (Step Size)
#   SA (Sensor Angle)
#   SO (Sensor Distance)
#   RA (Rotation Angle - turning sharpness)

def read_sound_data(path, frame):
    if not os.path.exists(path):
        return None
        
    try:
        with open(path, 'r') as f:
            lines = f.readlines()
            
        # Clamp frame to available line indicators
        total_frames = len(lines)
        if total_frames == 0:
            return None
            
        target_line = max(0, min(total_frames - 1, frame))
        data_string = lines[target_line].strip()
        
        # Parse: columns should be separated by comma or tab: [Bass, Mids, Highs, Beats]
        parts = data_string.split(',')
        return [float(p) for p in parts]
    except Exception as e:
        print("Error reading sound database: " + str(e))
        return None

# Read and evaluate file inputs
audio_values = read_sound_data(file_path, rhino_timeline_frame) if 'file_path' in globals() and 'rhino_timeline_frame' in globals() else None

if audio_values:
    # Columns map directly to Physarealm coefficients
    bass, mids, highs, beat = audio_values
    
    # Build beautiful syncd parameters:
    SS = 1.0 + (bass * 3.0)       # Kick drum expands movement
    SA = 20.0 + (highs * 50.0)    # Treble controls the vision branching angle
    SO = 5.0 + (mids * 15.0)      # Mid melody controls how far ahead mold looks (Sensor Offset)
    RA = 15.0 + (beat * 30.0)     # Immediate drum-beats make particles turn sharper!
else:
    # Baseline architectural settings
    SS = 1.2
    SA = 45.0
    SO = 8.0
    RA = 22.5

print("Timeline Analyzer [Frame {}]: Speed={:.2f}, Branch Vision={:.1f}".format(
    rhino_timeline_frame if 'rhino_timeline_frame' in globals() else 0, SS, SA))`
  }
];

export const EDUCATION_GUIDE = {
  coreConcepts: [
    {
      title: "تفاوت علمی مدل Physarealm (قارچ اسلایم) با الگوریتم کلونی مورچه (ACO)",
      content: "پلاگین Physarealm بر اساس مدل زیست‌شناختی **قارچ لجن‌رونده یا کپک مخاطی (Physarum Polycephalum)** طراحی شده است، در حالی که الگوریتم کلونی مورچه‌ها (ACO) برای مسیریابی بهینه کوتاه‌ترین پله استفاده می‌شود. تفاوت حیاتی در سنسورها است؛ ذرات گرسهاپر Physarealm دارای زاویه دید (Sensor Angle) و فاصله دید (Sensor Offset) هستند که به آن‌ها اجازه می‌دهد قبل از حرکت جاده‌ها را رصد کنند و شبکه‌های ارگانیک متراکمی شبیه بافت سلول یا کابل‌های ارتباطی بسازند. ما فرکانس‌های موسیقی را دقیقاً به همین پارامترهای دیداری کپک هماهنگ می‌کنیم."
    },
    {
      title: "قوانین نگاشت فرکانسی (Spectrum Mapping Rules)",
      content: "برای طراحی یک حجم سه بعدی ارگانیک صوتی ملموس، نگاشت پارامترهای ذرات به فرکانس‌های صوتی باید دارای انسجام هندسی باشد:\n\n" +
               "- **فرکانس‌های پایین و ضربات بم اصلی (Bass/Sub-bass):** این طول موج‌ها که بدنه اصلی انرژی موزیک را تشکیل می‌دهند باید بر سرعت حرکت ذرات (Step Size) و مقدار چسبندگی فیزیکی ردپا (Pheromone Deposit) تاثیرگذار باشند تا با زدن درام، جاده‌های حجیم ناگهانی ایجاد شود.\n" +
               "- **فرکانس‌های میانه (Mids/Melody):** مسئول تغییر شعاع انتشار ذرات و جذب‌کننده‌ها (Attractors) هستند. ملودی‌ها شکل‌های کلی و پیچش‌های قوس‌ها را تعیین می‌کنند.\n" +
               "- **فرکانس‌های بالا (Highs/Treble):** بر روی میزان واگرایی و شاخه‌زدگی سنسورها تأثیر دارند. فرکانس‌های ریز کلنی را به تولید فیلامنت‌ها و برآمدگی‌های باریک پر جزییات ترغیب می‌کنند."
    }
  ],
  stepByStepSetup: [
    {
      step: "۱. استخراج سیگنال‌های موسیقی در گرسهاپر",
      detail: "می‌توانید از پلاگین **Firefly** استفاده کنید. کامپوننت 'Frequency Spectrum' را وارد کنید، منبع صوتی را روی کارت صدا یا میکروفون تنظیم کنید. این گره فرکانس‌های مختلف را به یک لیست عددی (عموماً ۵۱۲ باند) تبدیل می‌کند. این لیست را سگمنت‌بندی کرده و فرکانس‌های بم (ایندکس‌های ابتدایی)، میانه (ایندکس‌های وسط) و زیر (ایندکس‌های انتهایی) را جداسازی کنید."
    },
    {
      step: "۲. ورودی‌دهی به Physarealm Agent Settings",
      detail: "برای اتصال این مقادیر صوتی، از کامپوننت **Physarealm Agent Settings** استفاده کنید:\n\n" +
               "- مقدار فرکانس بم نرمالایز شده را به ورودی **Step Size (SS)** متصل کنید (با یک فرمول ریاضی ساده، مثلاً محدوده خروجی را بین 0.8 تا 3.5 قرار دهید).\n" +
               "- مقدار فرکانس زیر (Highs) را به ورودی **Sensor Angle (SA)** یا جهت دید نماینده‌ها وارد کنید. این باعث می‌شود در فرکانس‌های بالا، مورچه‌ها با زوایای بازتر جستجو کنند و گستردگی حجمی فوق‌العاده‌ای حاصل شود."
    },
    {
      step: "۳. تعریف شرایط محیطی (Environment Settings)",
      detail: "در بخش **Physarealm Environment Settings**، تبخیر ردپا (Decay Rate) و انتشار (Diffusion Rate) را تنظیم کنید. با فرستادن ریتم‌های آرام به تبخیر فشرده، ردپاها فاقد ماندگاری می‌شوند، در حالی که در اوج ریتم‌های تند، تبخیر را کم کنید تا مسیرهای حجمی فرصت رشد، تعلیق و تبدیل شدن به هندسه‌های صلب را پیدا نمایند."
    },
    {
      step: "۴. تبدیل مسیرها به حجم معماری سه بعدی",
      detail: "خروجی Physarealm لیستی از نقاط متوالی است. با متصل کردن این نقاط به کامپوننت‌های **Curve** یا ابزار‌های مدلسازی توری مانند **Cocoon (متابال‌های هوشمند)** یا **Exoskeleton**، می‌توانید لوله‌های چندوجهی و حجم‌های ارگانیک یکپارچه‌ای بسازید که ضخامت و پیچیده‌گی آن‌ها به اوج و فرکانس‌های موزیک بستگی دارد."
    }
  ],
  parametricMappings: [
    { name: "Step Size (SS)", abbreviation: "SS", role: "حرکت طولی و شتاب ذرات", suggestion: "اتصال به ضربه بم درام (بیس هماهنگ)" },
    { name: "Sensor Angle (SA)", abbreviation: "SA", role: "زاویه انشعاب و شاخه‌زنی", suggestion: "اتصال به فرکانس‌های زیر و های‌هت‌ها" },
    { name: "Sensor Distance (SO)", abbreviation: "SO", role: "برد دیداری جلو یا دوربینی", suggestion: "اتصال به نوانس‌های ملودی و پیانو" },
    { name: "Pheromone Deposit (T)", abbreviation: "T", role: "ضخامت و چگالی اسکلت حجم", suggestion: "اتصال به وکال‌ها یا میانه‌های پیوسته" },
    { name: "Pheromone Evaporation (D)", abbreviation: "D", role: "میزان زوال ردپاها در فضا", suggestion: "همانندسازی فید اوت صدا در سکوت" },
  ],
  commonPitfalls: [
    {
      title: "نوسان شدید پارامترها و فروپاشی کلونی (Jittering)",
      solution: "سیگنال صوت خام به خاطر نوسانات مکرر ضربان، ایجاد پرش (Jitter) می‌کند. همیشه قبل از تحویل فرکانس به Physarealm، از کامپوننت‌های فیلتر با میانگین متحرک یا پایتون استفاده کنید تا صعود و سقوط متغیرها نرم و ارگانیک شود.\n\n`V_smooth = (V_current * 0.3) + (V_previous * 0.7)`"
    },
    {
      title: "مشکل لود نشدن Physarealm در راینوی هشت و نسخه‌های مدرن",
      solution: "پلاگین قدیمی Physarealm برای اجرا در دات‌نت فریم‌ورک‌های قدیمی طراحی شده است. چنانچه در راینو ۸ با ارور مواجه شدید، قبل از باز کردن اتمسفر گرسهاپر، دستور `SetDotNetRuntime` را در خط فرمان راینو بنویسید و آن را روی `.NET Framework` (به‌جای .NET Core پیش‌فرض) سوییچ کنید."
    }
  ]
};
