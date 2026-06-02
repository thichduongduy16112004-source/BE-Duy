import { useNavigate } from 'react-router';
import { MobileStudyTimeSelectionScreen } from '../components/MobileStudyTimeSelectionScreen';
import { useOnboarding } from '../context/OnboardingContext';
import { apiService } from '../services/apiService';

export default function StudyTimeSelectionScreen() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#f5f5dc]">
      <MobileStudyTimeSelectionScreen
        onBack={() => navigate('/onboarding/grade')}
        onComplete={async (studyTime) => {
          console.log('Selected study time:', studyTime);
          updateData({ studyTime });
          
          // Lấy thông tin lớp và map sang cấp học backend
          const gradeValue = data.grade || 'grade-6';
          const backendGrade: 'cap2' | 'cap3' = 
            (gradeValue === 'grade-10' || gradeValue === 'grade-11' || gradeValue === 'grade-12')
              ? 'cap3'
              : 'cap2';
              
          // Gọi API cập nhật onboarding ở backend (Mặc định chọn Trần Hưng Đạo)
          try {
            await apiService.updateOnboarding(backendGrade, 'tran-hung-dao');
          } catch (err) {
            console.error('Failed to complete onboarding on backend:', err);
          }
          
          navigate('/home');
        }}
      />
    </div>
  );
}