### piedra papel tijeras "the game".
el clasico juego de piedra papel tijeras consta de dos jugadores que en una partida tienen la oportunidad de elegir "Piedra","Papel", "Tijeras".

donde siguiendo la logica de:
Piedra - Gana a - Tijeras
Tijeras - Gana a - Papel
Papel - Gana a - Piedra
si un jugador (p1) elije piedra y el otro jugador (p2) elige tijera
El resultado de la partida sera que p1 gano ese round.
son tres rounds, si un jugador gana tres rounds gana la partida.

y queda en su score personal.

//Agregare la persistencia de los jugadores en bases de datos, y su score. al final para simular un cambio de logica del cliente

Casos de uso
1. Registrar Jugador [Listo]
  * Actor:Jugador
  * Proposito: Permitir que un nuevo jugador cree una identidad en el sistema para llevar su record de vicctorias
2. Gestionar Partida [Proceso]
  * Crear partida: Eljugador inicia una sala y espera a un oponente
  * Unirse a Pertida: El jugador ingresa a una sala existente mediante un ID o random match.
    notas de diseno e implementacion: 
      - las partidas viven en memoria, usare redis para gestionarlas.
      - los raunds tambien.
      - el usuario crea una room la cual llevara un id y sera publica o privada, y se unira automaticamente. 
      - si es privada, cuando un usuario se quiera unir, deberia colocar el id.
      - si es publica, cuando un usuario le de a random match, buscara la primera partida publica disponible y se unira.  
3. Jugar [...]
  * Acctor: Jugador
  * Flujo:
    1. El sistema solicita la jugada
    2. El jugador elige (Piedra, Papel, Tijera)
    3. El sistema valida la jugada.
    4. El sistema espera al oponente.
    5. El sistema determina y comunica el resultado
