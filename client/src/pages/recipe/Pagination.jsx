import React from "react";

/* eslint-disable react/prop-types */
function Pagination({ currentPage, totalPages, handlePage }) {
    return (
        <div className="flex justify-center space-x-1">
            <button
                className="rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={"key" + page}
                    className={`min-w-9 rounded-full py-2 px-3.5 border text-center text-sm transition-all ml-2 shadow-md
                    ${
                        page === currentPage
                            ? "bg-slate-800 text-white shadow-none cursor-default"
                            : "hover:bg-slate-700 hover:text-white active:bg-slate-700 hover:shadow-lg active:shadow-none focus:bg-slate-700"
                    }
                    ${!page === currentPage ? "border-transparent" : ""}
                    disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none`}
                    onClick={() => handlePage(page)}
                >
                    {page}
                </button>
            ))}
            <button
                className="min-w-9 rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                Next
            </button>
        </div>
    );
}

export default Pagination;
