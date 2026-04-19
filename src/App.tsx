import { useState } from 'react';

type TabType = 'bmi' | 'bmr' | 'tdee' | 'ideal' | 'bodyfat';

interface UserData {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activityLevel: number;
  neck: number;
  waist: number;
  hip: number;
}

const activityLevels = [
  { value: 1.2, label: 'Ít vận động (không tập thể dục)' },
  { value: 1.375, label: 'Nhẹ (1-3 ngày/tuần)' },
  { value: 1.55, label: 'Trung bình (3-5 ngày/tuần)' },
  { value: 1.725, label: 'Năng động (6-7 ngày/tuần)' },
  { value: 1.9, label: 'Rất năng động (tập 2 lần/ngày)' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('bmi');
  const [userData, setUserData] = useState<UserData>({
    gender: 'male',
    age: 25,
    height: 170,
    weight: 70,
    activityLevel: 1.55,
    neck: 38,
    waist: 80,
    hip: 95,
  });

  const updateField = (field: keyof UserData, value: number) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (bmi < 25) return { label: 'Bình thường', color: 'text-green-500', bg: 'bg-green-100' };
    if (bmi < 30) return { label: 'Thừa cân', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { label: 'Béo phì', color: 'text-red-500', bg: 'bg-red-100' };
  };

  const getBMRStatus = (bmr: number) => {
    const bmrPerKg = bmr / userData.weight;
    return {
      label: `${Math.round(bmr)} kcal/ngày`,
      subtext: `Trung bình ${Math.round(bmrPerKg)} kcal/kg/ngày`,
    };
  };

  const calculateBMI = () => {
    const heightM = userData.height / 100;
    return (userData.weight / (heightM * heightM)).toFixed(1);
  };

  const calculateBMR = () => {
    // Mifflin-St Jeor Equation
    if (userData.gender === 'male') {
      return Math.round(10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5);
    } else {
      return Math.round(10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161);
    }
  };

  const calculateTDEE = () => {
    return Math.round(calculateBMR() * userData.activityLevel);
  };

  const calculateIdealWeight = () => {
    // Devine Formula
    if (userData.gender === 'male') {
      return Math.round(50 + 2.3 * ((userData.height / 2.54) - 60));
    } else {
      return Math.round(45.5 + 2.3 * ((userData.height / 2.54) - 60));
    }
  };

  const calculateBodyFat = () => {
    // U.S. Navy Method
    let bodyFat: number;
    if (userData.gender === 'male') {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(userData.waist - userData.neck) + 0.15456 * Math.log10(userData.height)) - 450;
    } else {
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(userData.waist + userData.hip - userData.neck) + 0.22100 * Math.log10(userData.height)) - 450;
    }
    return bodyFat.toFixed(1);
  };

  const getBodyFatStatus = (bf: number) => {
    if (userData.gender === 'male') {
      if (bf < 6) return { label: 'Rất ít mỡ', color: 'text-blue-500' };
      if (bf < 14) return { label: 'Mức thể thao', color: 'text-green-500' };
      if (bf < 18) return { label: 'Bình thường', color: 'text-yellow-500' };
      if (bf < 25) return { label: 'Thừa cân', color: 'text-orange-500' };
      return { label: 'Béo phì', color: 'text-red-500' };
    } else {
      if (bf < 14) return { label: 'Rất ít mỡ', color: 'text-blue-500' };
      if (bf < 21) return { label: 'Mức thể thao', color: 'text-green-500' };
      if (bf < 25) return { label: 'Bình thường', color: 'text-yellow-500' };
      if (bf < 32) return { label: 'Thừa cân', color: 'text-orange-500' };
      return { label: 'Béo phì', color: 'text-red-500' };
    }
  };

  const renderResult = () => {
    switch (activeTab) {
      case 'bmi': {
        const bmi = parseFloat(calculateBMI());
        const status = getBMIStatus(bmi);
        return (
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{calculateBMI()}</div>
              <div className={`inline-block px-4 py-2 rounded-full ${status.bg} ${status.color} font-semibold`}>
                {status.label}
              </div>
            </div>
            <div className="mt-6 bg-white/20 rounded-xl p-4">
              <div className="text-sm opacity-80 mb-2">Thang đo BMI</div>
              <div className="h-4 rounded-full bg-white/30 overflow-hidden flex">
                <div className="bg-blue-400 h-full" style={{ width: '18.5%' }} />
                <div className="bg-green-400 h-full" style={{ width: '6.5%' }} />
                <div className="bg-yellow-400 h-full" style={{ width: '5%' }} />
                <div className="bg-red-400 h-full" style={{ width: '70%' }} />
              </div>
              <div className="flex justify-between text-xs mt-1 opacity-70">
                <span>&lt;18.5</span>
                <span>18.5-25</span>
                <span>25-30</span>
                <span>&gt;30</span>
              </div>
            </div>
          </div>
        );
      }
      case 'bmr': {
        const bmr = calculateBMR();
        const status = getBMRStatus(bmr);
        return (
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{status.label}</div>
              <div className="text-lg opacity-80">{status.subtext}</div>
            </div>
            <div className="mt-6 bg-white/20 rounded-xl p-4">
              <div className="text-sm opacity-80 mb-2">Năng lượng cơ bản</div>
              <p className="text-sm">Đây là lượng calories cơ thể đốt cháy khi nghỉ ngơi hoàn toàn để duy trì các chức năng sống.</p>
            </div>
          </div>
        );
      }
      case 'tdee': {
        const tdee = calculateTDEE();
        return (
          <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-8 text-white">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{tdee.toLocaleString()}</div>
              <div className="text-lg opacity-80">kcal/ngày</div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <div className="text-sm opacity-70">Giảm cân</div>
                <div className="font-bold">{tdee - 500}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <div className="text-sm opacity-70">Tăng cân</div>
                <div className="font-bold">{tdee + 500}</div>
              </div>
            </div>
          </div>
        );
      }
      case 'ideal': {
        const ideal = calculateIdealWeight();
        const diff = userData.weight - ideal;
        return (
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-8 text-white">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{ideal} kg</div>
              <div className="text-lg opacity-80">Cân nặng lý tưởng</div>
            </div>
            <div className="mt-6 bg-white/20 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="opacity-70">Hiện tại: {userData.weight}kg</span>
                <span className={`font-bold ${diff > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
                  {diff > 0 ? `+${Math.round(diff)}kg` : `${Math.round(diff)}kg`}
                </span>
              </div>
            </div>
          </div>
        );
      }
      case 'bodyfat': {
        const bf = parseFloat(calculateBodyFat());
        const status = getBodyFatStatus(bf);
        return (
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-8 text-white">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{bf}%</div>
              <div className={`text-lg font-semibold ${status.color}`}>
                {status.label}
              </div>
            </div>
            <div className="mt-6 bg-white/20 rounded-xl p-4">
              <div className="text-sm opacity-80 mb-2">Phương pháp U.S. Navy</div>
              <p className="text-xs opacity-70">Dựa trên số đo vòng cổ, eo và hông để ước tính tỷ lệ mỡ cơ thể.</p>
            </div>
          </div>
        );
      }
    }
  };

  const tabs = [
    { id: 'bmi', label: 'BMI', icon: '⚖️' },
    { id: 'bmr', label: 'BMR', icon: '🔥' },
    { id: 'tdee', label: 'TDEE', icon: '⚡' },
    { id: 'ideal', label: 'Cân lý tưởng', icon: '🎯' },
    { id: 'bodyfat', label: 'Mỡ cơ thể', icon: '💪' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-2xl font-bold text-white">Sức Khỏe Pro</h1>
          <p className="text-purple-300 text-sm">Theo dõi chỉ số sức khỏe của bạn</p>
        </div>

        {/* Result Card */}
        {renderResult()}

        {/* Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold mb-4">📝 Thông tin cá nhân</h3>
          
          {/* Gender */}
          <div>
            <label className="text-white/70 text-sm block mb-2">Giới tính</label>
            <div className="flex gap-3">
              <button
                onClick={() => setUserData(prev => ({ ...prev, gender: 'male' }))}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  userData.gender === 'male'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                👨 Nam
              </button>
              <button
                onClick={() => setUserData(prev => ({ ...prev, gender: 'female' }))}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  userData.gender === 'female'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                👩 Nữ
              </button>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="text-white/70 text-sm block mb-2">Tuổi: {userData.age}</label>
            <input
              type="range"
              min="15"
              max="80"
              value={userData.age}
              onChange={(e) => updateField('age', parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm block mb-2">Chiều cao (cm)</label>
              <input
                type="number"
                value={userData.height}
                onChange={(e) => updateField('height', parseInt(e.target.value) || 0)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">Cân nặng (kg)</label>
              <input
                type="number"
                value={userData.weight}
                onChange={(e) => updateField('weight', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>

          {/* Activity Level (only for TDEE) */}
          {activeTab === 'tdee' && (
            <div>
              <label className="text-white/70 text-sm block mb-2">Mức độ vận động</label>
              <select
                value={userData.activityLevel}
                onChange={(e) => updateField('activityLevel', parseFloat(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
              >
                {activityLevels.map(level => (
                  <option key={level.value} value={level.value} className="bg-gray-800">
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Body measurements (only for body fat) */}
          {activeTab === 'bodyfat' && (
            <>
              <div>
                <label className="text-white/70 text-sm block mb-2">Vòng cổ (cm)</label>
                <input
                  type="number"
                  value={userData.neck}
                  onChange={(e) => updateField('neck', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm block mb-2">Vòng eo (cm)</label>
                <input
                  type="number"
                  value={userData.waist}
                  onChange={(e) => updateField('waist', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                />
              </div>
              {userData.gender === 'female' && (
                <div>
                  <label className="text-white/70 text-sm block mb-2">Vòng hông (cm)</label>
                  <input
                    type="number"
                    value={userData.hip}
                    onChange={(e) => updateField('hip', parseInt(e.target.value) || 0)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-2xl mb-1">💡</div>
            <div className="text-white/50 text-xs">Mẹo sức khỏe</div>
            <div className="text-white text-sm mt-1">Uống đủ 2L nước mỗi ngày</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-2xl mb-1">🏃</div>
            <div className="text-white/50 text-xs">Vận động</div>
            <div className="text-white text-sm mt-1">30 phút mỗi ngày</div>
          </div>
        </div>

        <div className="mt-8 text-center text-white/40 text-sm">
          <p>Lưu ý: Các chỉ số chỉ mang tính tham khảo</p>
          <p className="mt-1">Hãy tham khảo ý kiến bác sĩ để có kết quả chính xác</p>
        </div>
      </div>
    </div>
  );
}

export default App;