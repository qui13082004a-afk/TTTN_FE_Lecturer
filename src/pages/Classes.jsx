/* eslint-disable react-hooks/set-state-in-effect */
// File: src/pages/Classes.jsx

import { useState, useEffect } from "react";
import { Search, PlusCircle, Loader2 } from "lucide-react";
import ClassCard from "../components/ClassCard";
import CreateClassModal from "../components/CreateClassModal";
import EditClassModal from "../components/EditClassModal";       
import DeleteClassModal from "../components/DeleteClassModal";   
import { fetchClasses, createClass, updateClass, deleteClass } from "../services/api";

export default function Classes() {
  const [classesList, setClassesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchClasses();
    setClassesList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNewClass = async (formData) => {
    const response = await createClass(formData);
    if(response.success) {
      alert(response.message);
      await loadData(); 
      setIsCreateModalOpen(false);
    } else {
      alert(response.message);
    }
  };

  const openEditModal = (classData) => {
    setSelectedClass(classData);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (classData) => {
    setSelectedClass(classData);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async (updatedClassData) => {
    const response = await updateClass(updatedClassData.id, updatedClassData);
    if (response.success) {
      alert(response.message);
      await loadData();
      setIsEditModalOpen(false);
    } else {
      alert(response.message);
    }
  };

  const handleConfirmDelete = async (idToDelete) => {
    const response = await deleteClass(idToDelete);
    if (response.success) {
      alert(response.message);
      await loadData();
      setIsDeleteModalOpen(false);
    } else {
      alert(response.message);
    }
  };

  const filteredClasses = classesList.filter(cls => 
    cls.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Danh sách lớp học</h2>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Tìm kiếm lớp học" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-red-500 text-sm" 
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>

        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          Tạo lớp học mới <PlusCircle size={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-4 text-red-500" size={40} />
          <p>Đang tải dữ liệu từ máy chủ...</p>
        </div>
      ) : (
        <>
          {filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClasses.map((cls) => (
                <ClassCard 
                  key={cls.id} 
                  {...cls} 
                  onEditClick={openEditModal}    
                  onDeleteClick={openDeleteModal} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 italic py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
              Không tìm thấy lớp học nào phù hợp với từ khóa "{searchQuery}".
            </div>
          )}
        </>
      )}

      <CreateClassModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateNewClass} />
      
      <EditClassModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        classData={selectedClass} 
        onSave={handleSaveEdit} 
      />
      
      <DeleteClassModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        classData={selectedClass} 
        onConfirm={handleConfirmDelete} 
      />
    </div>
  );
}