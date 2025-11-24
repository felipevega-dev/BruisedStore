import { Upload, MessageCircle, Palette, Clock, CheckCircle, Truck } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "Sube tu Imagen",
      description: "Carga la foto o referencia que deseas convertir en una obra de arte única",
      time: "1 min",
    },
    {
      icon: Palette,
      title: "Personaliza tu Obra",
      description: "Selecciona el tamaño del lienzo y ajusta los detalles de tu pedido",
      time: "2 min",
    },
    {
      icon: MessageCircle,
      title: "Te Contactamos",
      description: "En 24-48 horas te confirmamos detalles, precio final y forma de pago",
      time: "1-2 días",
    },
    {
      icon: Clock,
      title: "Creamos tu Obra",
      description: "Trabajamos en tu pieza con dedicación y pasión. Te enviamos fotos del progreso",
      time: "7-30 días",
    },
    {
      icon: CheckCircle,
      title: "Aprobación Final",
      description: "Te mostramos la obra terminada para tu aprobación antes del envío",
      time: "1 día",
    },
    {
      icon: Truck,
      title: "Recibe tu Obra",
      description: "Envío a domicilio con embalaje profesional o retiro en taller",
      time: "2-5 días",
    },
  ];

  const cardColors = [
    "bg-orange-50 border-orange-500",
    "bg-yellow-50 border-yellow-500",
    "bg-moss-50 border-moss-500",
    "bg-blue-50 border-blue-500",
    "bg-purple-50 border-purple-500",
    "bg-pink-50 border-pink-500",
  ];

  const iconBgColors = [
    "bg-orange-100 border-orange-500",
    "bg-yellow-100 border-yellow-500",
    "bg-moss-100 border-moss-500",
    "bg-blue-100 border-blue-500",
    "bg-purple-100 border-purple-500",
    "bg-pink-100 border-pink-500",
  ];

  const iconColors = [
    "text-orange-700",
    "text-yellow-700",
    "text-moss-700",
    "text-blue-700",
    "text-purple-700",
    "text-pink-700",
  ];

  const numberBgColors = [
    "bg-orange-500",
    "bg-yellow-500",
    "bg-black",
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  return (
    <div className="relative overflow-hidden border-4 border-black bg-linear-to-br from-orange-50 via-yellow-50 to-moss-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
      {/* Decorative circles */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-moss-200/30 blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-orange-200/30 blur-3xl"></div>

      <div className="relative mb-6 text-center">
        <h2 className="mb-3 text-2xl font-black text-black sm:text-3xl">
          ¿Cómo Funciona el Proceso?
        </h2>
        <div className="mx-auto h-2 w-20 bg-linear-to-r from-moss-500 via-orange-500 to-moss-500"></div>
        <p className="mt-4 text-base font-bold text-gray-800 sm:text-lg">
          Simple, transparente y colaborativo
        </p>
      </div>

      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className={`group relative border-4 ${cardColors[index]} p-5 transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5`}
            >
              {/* Step Number Badge */}
              <div className={`absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center border-4 border-black ${numberBgColors[index]} font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]`}>
                {index + 1}
              </div>

              {/* Icon */}
              <div className="mb-4 mt-2 flex items-center justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full border-4 ${iconBgColors[index]} transition-transform group-hover:scale-110`}>
                  <Icon className={`h-7 w-7 ${iconColors[index]}`} />
                </div>
                <div className={`rounded-full border-2 ${cardColors[index].split(' ')[1]} ${cardColors[index].split(' ')[0].replace('50', '100')} px-3 py-1 text-xs font-bold ${iconColors[index]}`}>
                  {step.time}
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-black text-black">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-800">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="relative mt-8 grid grid-cols-3 gap-3 border-t-4 border-black pt-6 sm:gap-4">
        <div className="group cursor-default rounded-lg border-4 border-moss-500 bg-moss-50 p-3 text-center transition-all hover:bg-moss-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-4">
          <div className="mb-2 text-2xl font-black text-moss-600 transition-transform group-hover:scale-110 sm:text-3xl">
            +100
          </div>
          <div className="text-xs font-bold text-moss-800 sm:text-sm">
            Obras Entregadas
          </div>
        </div>
        <div className="group cursor-default rounded-lg border-4 border-green-500 bg-green-50 p-3 text-center transition-all hover:bg-green-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-4">
          <div className="mb-2 text-2xl font-black text-green-600 transition-transform group-hover:scale-110 sm:text-3xl">
            100%
          </div>
          <div className="text-xs font-bold text-green-800 sm:text-sm">
            Satisfacción
          </div>
        </div>
        <div className="group cursor-default rounded-lg border-4 border-orange-500 bg-orange-50 p-3 text-center transition-all hover:bg-orange-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-4">
          <div className="mb-2 text-2xl transition-transform group-hover:scale-110 sm:text-3xl">
            🚚
          </div>
          <div className="text-xs font-bold text-orange-800 sm:text-sm">
            Envío a todo Chile
          </div>
        </div>
      </div>
    </div>
  );
}
