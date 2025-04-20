import React from "react";
import { Button, ComponentLoading, NoData, SingleCard } from "..";
import { BsArrowUpRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useMemo } from "react";

const HomeCategories = ({ title, data, isLoading, filterUsed, showFilterMessage = false }) => {

  const sortedData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data];
    return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first
  }, [data]);
  
  return (
    <>
      {isLoading ? (
        <ComponentLoading />
      ) : (
        <section className="box mt-28 flex flex-col items-center gap-6">
          <div className="w-full flex justify-between items-center">
            <h2 className="text-3xl font-bold capitalize">Latest {title}s</h2>
            <Link to={`/${title}`}>
              <Button
                content={"View More"}
                customCss={"rounded-lg text-sm"}
                icon={<BsArrowUpRight />}
              />
            </Link>
          </div>

          {showFilterMessage && filterUsed && (
            <p className="text-lg font-semibold text-primary">
              You can make {data?.length || 0} recipes!
            </p>
          )}

          <hr className="w-full" />

          {data?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 w-full">
              {sortedData.slice(0, 4).map((singleData) => (
                <div key={singleData._id} className="w-full">
                  <SingleCard
                    singleData={singleData}
                    type={title}
                    forceFavorite={null}
                  />
                </div>
              ))}
            </div>
          ) : (
            <NoData text={"Data"} />
          )}
        </section>
      )}
    </>
  );
};

export default HomeCategories;
