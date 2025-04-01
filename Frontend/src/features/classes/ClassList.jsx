import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { HiUserGroup, HiLockClosed, HiUserAdd, HiX } from 'react-icons/hi';
import { selectCurrentUser } from '../auth/authSlice';
import CreateClassModal from './CreateClassModal';
import JoinClassModal from './JoinClassModal';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const user = useSelector(selectCurrentUser);
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // TODO: Replace with actual API call
      const mockClasses = [
        {
          id: 1,
          name: 'Mathematics 101',
          enrollmentKey: 'math101',
          teacher: { name: 'John Doe' },
          studentCount: 45,
          createdAt: '2025-03-15',
        },
        {
          id: 2,
          name: 'Physics Advanced',
          enrollmentKey: 'phys202',
          teacher: { name: 'Jane Smith' },
          studentCount: 32,
          createdAt: '2025-03-20',
        },
      ];
      setClasses(mockClasses);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const handleCreateClass = async (classData) => {
    try {
      // TODO: Replace with actual API call
      toast.success('Class created successfully!');
      setShowCreateModal(false);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to create class');
    }
  };

  const handleJoinClass = async (enrollmentKey) => {
    try {
      // TODO: Replace with actual API call
      toast.success('Joined class successfully!');
      setShowJoinModal(false);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to join class');
    }
  };

  const handleBlockStudent = async (classId, studentId) => {
    try {
      // TODO: Replace with actual API call
      toast.success('Student blocked successfully');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to block student');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isTeacher ? 'My Classes' : 'Enrolled Classes'}
        </h2>
        <button
          onClick={() => isTeacher ? setShowCreateModal(true) : setShowJoinModal(true)}
          className="btn btn-primary flex items-center"
        >
          {isTeacher ? (
            <>
              <HiUserGroup className="h-5 w-5 mr-2" />
              Create Class
            </>
          ) : (
            <>
              <HiUserAdd className="h-5 w-5 mr-2" />
              Join Class
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {classItem.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Teacher: {classItem.teacher.name}
                  </p>
                </div>
                {isTeacher && (
                  <button
                    onClick={() => setSelectedClass(classItem)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <HiLockClosed className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <HiUserGroup className="h-5 w-5 mr-1" />
                  {classItem.studentCount} students
                </div>
                <span className="text-sm text-gray-500">
                  Created {new Date(classItem.createdAt).toLocaleDateString()}
                </span>
              </div>

              {isTeacher && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">Enrollment Key:</span>
                    <code className="px-2 py-1 bg-gray-100 rounded">
                      {classItem.enrollmentKey}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <HiUserGroup className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No classes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isTeacher
                ? 'Get started by creating a new class'
                : 'Join a class using an enrollment key'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClass}
        />
      )}

      {showJoinModal && (
        <JoinClassModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinClass}
        />
      )}
    </div>
  );
};

export default ClassList;
