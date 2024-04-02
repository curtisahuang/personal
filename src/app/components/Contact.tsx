"use client";

const Contact = () => {
  return (
    <div className="flex justify-between items-center uppercase pt-10 sm:pb-10 leading-[2.75rem]">
      <div className="w-[360px]">
        <div className="flex justify-between tracking-[0.5em]">
          <h2>Full</h2>
          <h2>Stack</h2>
        </div>

        <div className="flex justify-between pb-6 tracking-[0.7em]">
          <h2>developer</h2>
          <h2></h2>
        </div>

        <a
          href="https://wa.me/85255781337"
          className="transition duration-500 hover:text-[#555]"
        >
          <div className="flex justify-between tracking-[0.9em] ">
            <h2>whatsapp</h2>
          </div>
          <div className="flex justify-between pb-6 tracking-[0.3em]">
            <h2>+852</h2>
            <h2>55781337</h2>
          </div>
        </a>

        <a
          href="tel:+447479227231"
          className="transition duration-500 hover:text-[#555]"
        >
          <div className="flex justify-between tracking-[0.65em]">
            <h2>telephone</h2>
            <h2></h2>
          </div>
          <div className="flex justify-between pb-6 tracking-[0.2em] font-normal">
            <h2>+447479</h2>
            <h2>227231</h2>
          </div>
        </a>

        <a
          href="mailto:curtisahuang@gmail.com"
          className="transition duration-500 hover:text-[#555]"
        >
          <div className="flex justify-between">
            <h2>curtisahuang</h2>
          </div>
          <div className="flex justify-between pb-2 tracking-[0.44em]">
            <h2>
              <span className="font-sans">@</span>
            </h2>
            <h2>gmail.com</h2>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Contact;
