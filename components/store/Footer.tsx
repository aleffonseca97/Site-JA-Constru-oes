import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Topo: logo e identidade */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-ja.png"
              alt="J.A Construções"
              width={48}
              height={48}
              className="h-12 w-auto object-contain"
            />
            <div>
              <p className="font-bold text-gray-900 text-lg">
                J.A. Materiais para Construção 
              </p>
              <p className="text-sm text-gray-600">Desde 1994 em Paulicéia</p>
            </div>
          </div>
         
        </div>

        {/* Conteúdo em colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8">
          {/* Diferenciais */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">
              Tudo para sua obra com
            </h3>
            <ul className="space-y-1 text-gray-600 text-sm">
              <li>• Atendimento diferenciado</li>
              <li>• Preços e condições especiais</li>
            </ul>
            <p className="mt-3 text-gray-700 font-medium text-sm">
              A loja da sua família é aqui! 
            </p>
          </div>

          {/* Trabalhamos com */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">
              Trabalhamos com
            </h3>
            <ul className="space-y-1 text-gray-600 text-sm">
              <li>• Cimento</li>
              <li>• Cal</li>
              <li>• Areia</li>
              <li>• Pedra</li>
              <li>• Ferragens em geral</li>
              <li>• Material Hidráulico</li>
              <li>• Material Elétrico</li>
            </ul>
          </div>

          {/* Minha Casa Minha Vida */}
          <div>
            <h3 className="font-bold text-yellow-600 mb-2 text-sm uppercase tracking-wide">
              Linha de financiamentos
            </h3>
            <p className="text-gray-700 font-medium text-sm mb-2">
              Minha Casa Minha Vida
            </p>
            <ul className="space-y-1 text-gray-600 text-sm">
              <li>• Construímos a sua casa</li>
              <li>• Te entregamos com a chave na mão!</li>
            </ul>
          </div>

          {/* Contato e endereço */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">
              Novo endereço
            </h3>
            <address className="text-gray-600 text-sm not-italic space-y-1">
              <p>Av. Paulista, 1139</p>
              <p>Paulicéia, SP</p>
              <p className="mt-2">
                <span className="inline-block mr-1">📞</span>
                <a
                  href="tel:+5518997277876"
                  className="text-yellow-600 hover:text-yellow-500 font-medium"
                >
                  (18) 99727-7876
                </a>
              </p>
            </address>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm pt-4 border-t border-gray-200">
          J.A. Materiais para Construção — Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
