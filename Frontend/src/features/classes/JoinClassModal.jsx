import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { HiX } from 'react-icons/hi';

const JoinClassModal = ({ onClose, onJoin }) => {
  const [enrollmentKey, setEnrollmentKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin(enrollmentKey);
  };

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto"
      onClose={onClose}
      open={true}
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="inline-block h-screen align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Join Class
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="enrollmentKey"
                className="block text-sm font-medium text-gray-700"
              >
                Enrollment Key
              </label>
              <input
                type="text"
                id="enrollmentKey"
                required
                value={enrollmentKey}
                onChange={(e) => setEnrollmentKey(e.target.value.toUpperCase())}
                className="mt-1 input uppercase"
                placeholder="Enter enrollment key"
                pattern="[A-Z0-9]{6}"
                title="6 characters, uppercase letters and numbers only"
                maxLength={6}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the 6-character enrollment key provided by your teacher
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={enrollmentKey.length !== 6}
              >
                Join Class
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default JoinClassModal;
