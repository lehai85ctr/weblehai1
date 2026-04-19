import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

type TabType = 'bmi' | 'bodyFat' | 'calories' | 'heartRate' | 'water' | 'idealWeight';

interface HealthData {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  waist: number;
  neck: number;
  hip: number;
  activityLevel: number;
  restingHeartRate: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('bmi');
  const [healthData, setHealthData] = useState<HealthData>({
    height: 170,
    weight: 70,
    age: 30,
    gender: 'male',
    waist: 85,
    neck: 40,
    hip: 100,
    activityLevel: 1.55,
    restingHeartRate: 70,
  });

  // Calculate BMI
  const calculateBMI = (): number => {
    const heightInMeters = healthData.height / 100;
    return healthData.weight / (heightInMeters * heightInMeters);
  };

  const getBMIStatus = (bmi: number): { status: string; color: string; description: string } => {
    if (bmi < 18.5) return { status: 'Gầy', color: 'text-blue-500', description: 'Bạn cần tăng cân để đạt chỉ số khỏe mạnh' };
    if (bmi < 23) return { status: 'Bình thường', color: 'text-green-500', description: 'Chỉ số cân đối, tuyệt vời!' };
    if (bmi < 25) return { status: 'Thừa cân', color: 'text-yellow-500', description: 'Hãy chú ý đến chế độ ăn uống' };
    if (bmi < 30) return { status: 'Béo phì độ I', color: 'text-orange-500', description: 'Cần giảm cân để bảo vệ sức khỏe' };
    return { status: 'Béo phì độ II+', color: 'text-red-500', description: 'Nghiêm trọng, hãy tham khảo ý kiến bác sĩ' };
  };

  // Calculate Body Fat Percentage using US Navy Method
  const calculateBodyFat = (): number => {
    const { height, waist, neck, hip, gender } = healthData;
    if (gender === 'male') {
      return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    } else {
      return 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    }
  };

  const getBodyFatStatus = (bf: number, gender: string): { status: string; color: string } => {
    if (gender === 'male') {
      if (bf < 6) return { status: 'Rất thấp', color: 'text-blue-500' };
      if (bf < 14) return { status: 'Thể thao', color: 'text-cyan-500' };
      if (bf < 18) return { status: 'Tốt', color: 'text-green-500' };
      if (bf < 25) return { status: 'Bình thường', color: 'text-yellow-500' };
      return { status: 'Cao', color: 'text-red-500' };
    } else {
      if (bf < 14) return { status: 'Rất thấp', color: 'text-blue-500' };
      if (bf < 21) return { status: 'Thể thao', color: 'text-cyan-500' };
      if (bf < 25) return { status: 'Tốt', color: 'text-green-500' };
      if (bf < 32) return { status: 'Bình thường', color: 'text-yellow-500' };
      return { status: 'Cao', color: 'text-red-500' };
    }
  };

  // Calculate BMR and TDEE
  const calculateBMR = (): number => {
    const { weight, height, age, gender } = healthData;
    if (gender === 'male') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    }
  };

  const calculateTDEE = (): number => {
    return calculateBMR() * healthData.activityLevel;
  };

  // Calculate Ideal Weight (Devine formula)
  const calculateIdealWeight = (): { min: number; max: number; devine: number } => {
    const heightCm = healthData.height;
    const gender = healthData.gender;
    
    // BMI range 18.5 - 24.9
    const heightM = heightCm / 100;
    const min = 18.5 * heightM * heightM;
    const max = 24.9 * heightM * heightM;
    
    // Devine formula
    const baseHeight = 152.4; // 5 feet in cm
    const extraInches = (heightCm - baseHeight) / 2.54;
    const devine = gender === 'male' 
      ? 50 + 2.3 * Math.max(0, extraInches)
      : 45.5 + 2.3 * Math.max(0, extraInches);
    
    return { min: Math.round(min), max: Math.round(max), devine: Math.round(devine) };
  };

  // Calculate daily water intake
  const calculateWaterIntake = (): number => {
    return Math.round(healthData.weight * 0.033 * 10) / 10;
  };

  // Calculate heart rate zones
  const calculateHeartRateZones = () => {
    const maxHR = 220 - healthData.age;
    const restingHR = healthData.restingHeartRate;
    const reserve = maxHR - restingHR;
    
    return {
      maxHR,
      zones: [
        { name: 'Ngủ nghỉ', min: restingHR, max: restingHR + 10, color: '#94a3b8' },
        { name: 'Rất nhẹ', min: Math.round(restingHR + reserve * 0.5), max: Math.round(restingHR + reserve * 0.6), color: '#22c55e' },
        { name: 'Nhẹ', min: Math.round(restingHR + reserve * 0.6), max: Math.round(restingHR + reserve * 0.7), color: '#84cc16' },
        { name: 'Trung bình', min: Math.round(restingHR + reserve * 0.7), max: Math.round(restingHR + reserve * 0.8), color: '#eab308' },
        { name: 'Nặng', min: Math.round(restingHR + reserve * 0.8), max: Math.round(restingHR + reserve * 0.9), color: '#f97316' },
        { name: 'Tối đa', min: Math.round(restingHR + reserve * 0.9), max: maxHR, color: '#ef4444' },
      ],
    };
  };

  // Radar chart data for health scores
  const getRadarData = () => {
    const bmi = calculateBMI();
    const bmiScore = bmi >= 18.5 && bmi <= 25 ? 100 : bmi < 18.5 ? (bmi / 18.5) * 100 : Math.max(0, 100 - (bmi - 25) * 5);
    const bf = Math.max(0, Math.min(100, calculateBodyFat()));
    const bfScore = healthData.gender === 'male' 
      ? (bf >= 10 && bf <= 20 ? 100 : bf < 10 ? (bf / 10) * 100 : Math.max(0, 100 - (bf - 20) * 5))
      : (bf >= 18 && bf <= 28 ? 100 : bf < 18 ? (bf / 18) * 100 : Math.max(0, 100 - (bf - 28) * 5));
    
    return [
      { subject: 'BMI', A: Math.round(bmiScore), fullMark: 100 },
      { subject: 'Mỡ cơ thể', A: Math.round(bfScore), fullMark: 100 },
      { subject: 'Hoạt động', A: 75, fullMark: 100 },
      { subject: 'Ngủ', A: 70, fullMark: 100 },
      { subject: 'Dinh dưỡng', A: 80, fullMark: 100 },
      { subject: 'Tim mạch', A: 85, fullMark: 100 },
    ];
  };

  const activityLevels = [
    { value: 1.2, label: 'Ít vận động' },
    { value: 1.375, label: 'Vận động nhẹ' },
    { value: 1.55, label: 'Vận động trung bình' },
    { value: 1.725, label: 'Vận động nhiều' },
    { value: 1.9, label: 'Vận động rất nhiều' },
  ];

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'bmi', label: 'BMI', icon: '⚖️' },
    { key: 'bodyFat', label: 'Mỡ cơ thể', icon: '📏' },
    { key: 'calories', label: 'Năng lượng', icon: '🔥' },
    { key: 'idealWeight', label: 'Cân nặng lý tưởng', icon: '🎯' },
    { key: 'water', label: 'Nước', icon: '💧' },
    { key: 'heartRate', label: 'Nhịp tim', icon: '❤️' },
  ];

  const handleInputChange = (field: keyof HealthData, value: number | string) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💚</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Health Tracker Pro</h1>
                <p className="text-sm text-gray-500">Đo lường chỉ số sức khỏe toàn diện</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📝</span> Thông tin của bạn
              </h2>
              
              <div className="space-y-4">
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Giới tính</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInputChange('gender', 'male')}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        healthData.gender === 'male'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      👨 Nam
                    </button>
                    <button
                      onClick={() => handleInputChange('gender', 'female')}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        healthData.gender === 'female'
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      👩 Nữ
                    </button>
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Chiều cao: <span className="text-teal-600 font-semibold">{healthData.height} cm</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    value={healthData.height}
                    onChange={(e) => handleInputChange('height', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>100 cm</span>
                    <span>220 cm</span>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Cân nặng: <span className="text-teal-600 font-semibold">{healthData.weight} kg</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={healthData.weight}
                    onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>30 kg</span>
                    <span>150 kg</span>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Tuổi: <span className="text-teal-600 font-semibold">{healthData.age} tuổi</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={healthData.age}
                    onChange={(e) => handleInputChange('age', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>18 tuổi</span>
                    <span>80 tuổi</span>
                  </div>
                </div>

                {/* Waist */}
                {(activeTab === 'bodyFat') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Vòng eo: <span className="text-teal-600 font-semibold">{healthData.waist} cm</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={healthData.waist}
                      onChange={(e) => handleInputChange('waist', Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                )}

                {/* Neck */}
                {(activeTab === 'bodyFat') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Vòng cổ: <span className="text-teal-600 font-semibold">{healthData.neck} cm</span>
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="60"
                      value={healthData.neck}
                      onChange={(e) => handleInputChange('neck', Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                )}

                {/* Hip */}
                {(activeTab === 'bodyFat' && healthData.gender === 'female') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Vòng mông: <span className="text-teal-600 font-semibold">{healthData.hip} cm</span>
                    </label>
                    <input
                      type="range"
                      min="70"
                      max="150"
                      value={healthData.hip}
                      onChange={(e) => handleInputChange('hip', Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                )}

                {/* Activity Level */}
                {(activeTab === 'calories') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Mức độ hoạt động</label>
                    <select
                      value={healthData.activityLevel}
                      onChange={(e) => handleInputChange('activityLevel', Number(e.target.value))}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {activityLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Resting Heart Rate */}
                {(activeTab === 'heartRate') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Nhịp tim nghỉ ngơi: <span className="text-teal-600 font-semibold">{healthData.restingHeartRate} bpm</span>
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={healthData.restingHeartRate}
                      onChange={(e) => handleInputChange('restingHeartRate', Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Thống kê nhanh</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-teal-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-teal-600">{calculateBMI().toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Chỉ số BMI</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">{Math.round(calculateBMR())}</div>
                  <div className="text-xs text-gray-500">BMR (kcal)</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{calculateWaterIntake()}L</div>
                  <div className="text-xs text-gray-500">Nước/ngày</div>
                </div>
                <div className="bg-pink-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-pink-600">{220 - healthData.age}</div>
                  <div className="text-xs text-gray-500">Nhịp tim tối đa</div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* BMI Calculator */}
            {activeTab === 'bmi' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>⚖️</span> Tính chỉ số BMI
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">{calculateBMI().toFixed(1)}</div>
                        <div className="text-sm text-white/80">Chỉ số BMI</div>
                      </div>
                    </div>
                    <div className={`mt-4 text-xl font-bold ${getBMIStatus(calculateBMI()).color}`}>
                      {getBMIStatus(calculateBMI()).status}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 px-4">
                      {getBMIStatus(calculateBMI()).description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">Phạm vi BMI</h3>
                    <div className="space-y-3">
                      {[
                        { range: '< 18.5', label: 'Gầy', color: 'bg-blue-500' },
                        { range: '18.5 - 22.9', label: 'Bình thường', color: 'bg-green-500' },
                        { range: '23 - 24.9', label: 'Thừa cân', color: 'bg-yellow-500' },
                        { range: '25 - 29.9', label: 'Béo phì độ I', color: 'bg-orange-500' },
                        { range: '≥ 30', label: 'Béo phì độ II+', color: 'bg-red-500' },
                      ].map(item => (
                        <div key={item.range} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm text-gray-600 w-24">{item.range}</span>
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BMI Scale Visual */}
                <div className="mt-8">
                  <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-500">
                    <div 
                      className="absolute top-0 w-1 h-full bg-white shadow-lg transform -translate-x-1/2 transition-all duration-500"
                      style={{ left: `${Math.min(100, Math.max(0, (calculateBMI() - 15) / 25 * 100))}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        Bạn
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>15</span>
                    <span>18.5</span>
                    <span>23</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40</span>
                  </div>
                </div>

                {/* Health Radar */}
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-700 mb-4">Đánh giá tổng thể</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={getRadarData()}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <Radar name="Điểm sức khỏe" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Body Fat */}
            {activeTab === 'bodyFat' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>📏</span> Tính tỷ lệ mỡ cơ thể
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">{Math.max(0, Math.min(50, calculateBodyFat())).toFixed(1)}%</div>
                        <div className="text-sm text-white/80">Mỡ cơ thể</div>
                      </div>
                    </div>
                    <div className={`mt-4 text-xl font-bold ${getBodyFatStatus(Math.max(0, calculateBodyFat()), healthData.gender).color}`}>
                      {getBodyFatStatus(Math.max(0, calculateBodyFat()), healthData.gender).status}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">Phạm vi lý tưởng</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giới tính</span>
                          <span className="font-medium">{healthData.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tuổi</span>
                          <span className="font-medium">{healthData.age} tuổi</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phạm vi tốt</span>
                          <span className="font-medium text-green-600">
                            {healthData.gender === 'male' ? '10-20%' : '18-28%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phạm vi bình thường</span>
                          <span className="font-medium">
                            {healthData.gender === 'male' ? '18-25%' : '25-32%'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-4">
                      * Tính toán theo phương pháp US Navy. Độ chính xác có thể dao động ±2-3%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Calories */}
            {activeTab === 'calories' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>🔥</span> Nhu cầu năng lượng hàng ngày
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white">
                      <div className="text-sm opacity-80">BMR (Trao đổi chất cơ bản)</div>
                      <div className="text-4xl font-bold mt-1">{Math.round(calculateBMR())} <span className="text-xl">kcal/ngày</span></div>
                      <p className="text-sm mt-2 opacity-80">Năng lượng cần cho cơ thể hoạt động cơ bản</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl p-6 text-white">
                      <div className="text-sm opacity-80">TDEE (Tổng năng lượng)</div>
                      <div className="text-4xl font-bold mt-1">{Math.round(calculateTDEE())} <span className="text-xl">kcal/ngày</span></div>
                      <p className="text-sm mt-2 opacity-80">Năng lượng thực tế cần với mức hoạt động</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">Mục tiêu cân nặng</h3>
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-red-700">Giảm cân 0.5kg/tuần</span>
                          <span className="font-bold text-red-600">{Math.round(calculateTDEE() - 500)} kcal</span>
                        </div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-orange-700">Giảm cân 0.25kg/tuần</span>
                          <span className="font-bold text-orange-600">{Math.round(calculateTDEE() - 250)} kcal</span>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-green-700">Giữ cân</span>
                          <span className="font-bold text-green-600">{Math.round(calculateTDEE())} kcal</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-700">Tăng cân 0.25kg/tuần</span>
                          <span className="font-bold text-blue-600">{Math.round(calculateTDEE() + 250)} kcal</span>
                        </div>
                      </div>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-teal-700">Tăng cân 0.5kg/tuần</span>
                          <span className="font-bold text-teal-600">{Math.round(calculateTDEE() + 500)} kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Macro Chart */}
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-700 mb-4">Phân bổ Macronutrients (50/30/20)</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Carbs', gram: Math.round(calculateTDEE() * 0.5 / 4), color: '#f59e0b' },
                        { name: 'Protein', gram: Math.round(calculateTDEE() * 0.3 / 4), color: '#ef4444' },
                        { name: 'Chất béo', gram: Math.round(calculateTDEE() * 0.2 / 9), color: '#3b82f6' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} />
                        <Tooltip />
                        <Bar dataKey="gram" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Ideal Weight */}
            {activeTab === 'idealWeight' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>🎯</span> Cân nặng lý tưởng
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-8 text-white">
                      <div className="text-sm opacity-80">Phạm vi cân nặng khỏe mạnh</div>
                      <div className="text-4xl font-bold mt-2">
                        {calculateIdealWeight().min} - {calculateIdealWeight().max} kg
                      </div>
                      <p className="text-sm mt-4 opacity-80">Dựa trên chỉ số BMI 18.5 - 24.9</p>
                    </div>
                    
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600">Cân nặng lý tưởng (Công thức Devine)</div>
                      <div className="text-2xl font-bold text-teal-600 mt-1">{calculateIdealWeight().devine} kg</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">Đánh giá cân nặng hiện tại</h3>
                    <div className="relative pt-4 pb-8">
                      {/* Weight Scale */}
                      <div className="h-4 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 relative">
                        <div 
                          className="absolute top-1/2 w-6 h-6 bg-white border-4 border-teal-500 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                          style={{ 
                            left: `${Math.min(100, Math.max(0, 
                              (healthData.weight - (calculateIdealWeight().min - 10)) / 
                              (calculateIdealWeight().max - calculateIdealWeight().min + 20) * 100
                            ))}%` 
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {healthData.weight} kg
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{calculateIdealWeight().min - 10} kg</span>
                        <span className="text-green-600 font-medium">Khoẻ mạnh</span>
                        <span>{calculateIdealWeight().max + 10} kg</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">💡 Lời khuyên</h4>
                      {healthData.weight < calculateIdealWeight().min && (
                        <p className="text-sm text-gray-600">Bạn nên tăng cân để đạt đến phạm vi khỏe mạnh. Tập trung vào dinh dưỡng cân bằng và tập luyện sức bền.</p>
                      )}
                      {healthData.weight >= calculateIdealWeight().min && healthData.weight <= calculateIdealWeight().max && (
                        <p className="text-sm text-gray-600">Tuyệt vời! Cân nặng của bạn nằm trong phạm vi khỏe mạnh. Hãy duy trì lối sống lành mạnh.</p>
                      )}
                      {healthData.weight > calculateIdealWeight().max && (
                        <p className="text-sm text-gray-600">Bạn nên giảm cân từ từ để đạt đến phạm vi khỏe mạnh. Kết hợp chế độ ăn uống hợp lý và tập luyện đều đặn.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Water */}
            {activeTab === 'water' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>💧</span> Nhu cầu nước hàng ngày
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="relative w-48 h-64 mx-auto">
                      {/* Water Bottle */}
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 rounded-3xl border-4 border-gray-300 overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500"
                          style={{ height: '60%' }}
                        >
                          <div className="absolute inset-0 opacity-30">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="absolute bg-white rounded-full animate-pulse" style={{
                                width: `${10 + Math.random() * 20}px`,
                                height: `${10 + Math.random() * 20}px`,
                                left: `${Math.random() * 80}%`,
                                bottom: `${Math.random() * 80}%`,
                                animationDelay: `${i * 0.5}s`
                              }}></div>
                            ))}
                          </div>
                        </div>
                        {/* Level markers */}
                        {[1, 2, 3, 4].map(level => (
                          <div key={level} className="absolute right-2 text-xs text-gray-500 font-medium" style={{ bottom: `${level * 25}%` }}>
                            {level * 0.5}L
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-4xl font-bold text-blue-600">{calculateWaterIntake()} <span className="text-xl">lít</span></div>
                      <p className="text-sm text-gray-500 mt-1">khoảng {Math.round(calculateWaterIntake() * 4)} cốc nước</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">Mẹo uống đủ nước</h3>
                    <div className="space-y-3">
                      {[
                        { icon: '🌅', text: 'Uống 1 cốc nước ngay sau khi thức dậy' },
                        { icon: '⏰', text: 'Đặt nhắc nhở mỗi 2 giờ' },
                        { icon: '🍎', text: 'Ăn trái cây và rau quả nhiều nước' },
                        { icon: '🏋️', text: 'Uống thêm nước khi tập luyện' },
                        { icon: '🍵', text: 'Trà và cà phê cũng tính vào tổng lượng (điều độ)' },
                        { icon: '🥤', text: 'Mang bình nước theo mọi lúc' },
                      ].map((tip, i) => (
                        <div key={i} className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                          <span className="text-xl">{tip.icon}</span>
                          <span className="text-sm text-gray-700">{tip.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Heart Rate */}
            {activeTab === 'heartRate' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>❤️</span> Các vùng nhịp tim
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-gradient-to-br from-rose-400 to-red-500 rounded-xl p-6 text-white text-center">
                      <div className="text-sm opacity-80">Nhịp tim tối đa (220 - tuổi)</div>
                      <div className="text-5xl font-bold mt-2">{calculateHeartRateZones().maxHR} <span className="text-2xl">bpm</span></div>
                      <p className="text-sm mt-2 opacity-80">Nhịp tim cao nhất có thể đạt được</p>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-sm text-gray-500">Nghỉ ngơi</div>
                        <div className="text-2xl font-bold text-gray-700">{healthData.restingHeartRate}</div>
                        <div className="text-xs text-gray-400">bpm</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-sm text-gray-500">Dự trữ</div>
                        <div className="text-2xl font-bold text-rose-600">{calculateHeartRateZones().maxHR - healthData.restingHeartRate}</div>
                        <div className="text-xs text-gray-400">bpm</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">5 vùng nhịp tim</h3>
                    <div className="space-y-2">
                      {calculateHeartRateZones().zones.slice(1).map((zone, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }}></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">{zone.name}</span>
                              <span className="text-sm text-gray-500">{zone.min} - {zone.max} bpm</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${((zone.max - zone.min) / (calculateHeartRateZones().maxHR - healthData.restingHeartRate)) * 100}%`,
                                  backgroundColor: zone.color,
                                  marginLeft: `${((zone.min - healthData.restingHeartRate) / (calculateHeartRateZones().maxHR - healthData.restingHeartRate)) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Heart Rate Chart */}
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-700 mb-4">Phân bổ cường độ tập luyện</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: 'Khởi động', hr: healthData.restingHeartRate + 30, zone: 1 },
                        { name: 'Đốt mỡ', hr: healthData.restingHeartRate + 50, zone: 2 },
                        { name: 'Hiếu khí', hr: healthData.restingHeartRate + 70, zone: 3 },
                        { name: 'Yếm khí', hr: healthData.restingHeartRate + 90, zone: 4 },
                        { name: 'Tối đa', hr: calculateHeartRateZones().maxHR, zone: 5 },
                      ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                      <YAxis domain={[healthData.restingHeartRate, calculateHeartRateZones().maxHR]} tick={{ fill: '#6b7280' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', strokeWidth: 2, r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>⚠️ Công cụ này chỉ mang tính tham khảo. Vui lòng tham khảo ý kiến bác sĩ để có đánh giá chính xác nhất.</p>
            <p className="mt-2">Health Tracker Pro © 2024 - Sức khỏe là vốn quý nhất</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
