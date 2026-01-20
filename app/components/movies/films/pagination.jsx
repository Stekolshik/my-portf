"use client";
import React from "react";
import "./pagination.css";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) {
  const [, forceUpdate] = React.useState(0);
  const numberPageRef = React.useRef(currentPage);

  React.useEffect(() => {
    numberPageRef.current = currentPage;
    forceUpdate((n) => n + 1);
  }, [currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlPrev = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      onPageChange(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      onPageChange(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const numberPrev = () => {
    if (numberPageRef.current > 1) {
      numberPageRef.current -= 1;
      forceUpdate((n) => n + 1);
    }
  };

  const numberNext = () => {
    if (numberPageRef.current < totalPages) {
      numberPageRef.current += 1;
      forceUpdate((n) => n + 1);
    }
  };

  return (
    <>
      <div className="pagination">
        <button
          className="prev"
          onClick={handlPrev}
          disabled={currentPage === 1}
        >
          <img src={"/Arrow.svg"} alt="Стрелка" className="Svgleft" />
        </button>

        <button
          className="prev"
          onClick={numberPrev}
          disabled={numberPageRef.current === 1}
        >
          <img src={"/right.svg"} alt="Стрелка" className="Svgleft" />
        </button>

        <div className="pag">
          <button
            className="pagButtons"
            onClick={() => goToPage(numberPageRef.current - 1)}
            disabled={numberPageRef.current <= 1}
          >
            <span>{numberPageRef.current - 1}</span>
          </button>

          <button
            className={`pagButtons ${
              numberPageRef.current === currentPage ? "active" : ""
            }`}
            onClick={() => goToPage(numberPageRef.current)}
          >
            <span>{numberPageRef.current}</span>
          </button>

          <button
            className="pagButtons"
            onClick={() => goToPage(numberPageRef.current + 1)}
            disabled={numberPageRef.current >= totalPages}
          >
            <span>{numberPageRef.current + 1}</span>
          </button>
          <button
            className="pagLastButtons"
            onClick={() => goToPage(totalPages)}
            disabled={numberPageRef.current >= totalPages}
          >
            ...{totalPages}
          </button>
        </div>

        <button
          className="next"
          onClick={numberNext}
          disabled={numberPageRef.current === totalPages || totalPages === 0}
        >
          <img src={"/right.svg"} alt="Стрелка" className="SvgRight" />
        </button>

        <button
          className="next"
          onClick={handlNext}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <img src={"/Arrow.svg"} alt="Стрелка" className="SvgRight" />
        </button>
      </div>

      <div className="pagination-info">
        <span>🎞️ movies: {totalItems}</span>
        <span>📄 Total pages: {totalPages}</span>
      </div>
    </>
  );
}
