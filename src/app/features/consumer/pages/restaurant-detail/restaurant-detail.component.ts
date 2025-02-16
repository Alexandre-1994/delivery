import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Location } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurant-detail',
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.scss'],
  standalone: true,
  imports: [
    IonicModule,CurrencyPipe, CommonModule]
})
export class RestaurantDetailComponent  implements OnInit {
  restaurantId: string | null = null;
  restaurant: any = {}; 


  constructor(private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    // Captura o 'id' do restaurante da URL
    this.restaurantId = this.route.snapshot.paramMap.get('id');
    
    // Aqui você normalmente faria uma requisição para obter o restaurante
    // mas por enquanto, vamos usar um exemplo de dados fixos:
    if (this.restaurantId) {
      this.restaurant = this.getRestaurantDetailsById(this.restaurantId);
    }
  }
// Exemplo de função para pegar os detalhes do restaurante pelo id
getRestaurantDetailsById(id: string) {
  // Dados fixos de exemplo, substitua por uma chamada real à API ou banco de dados
  const restaurants = [
    { id: '1', name: 'Restaurante Típico', cuisine: 'Comida Angolana', rating: 4.5, deliveryTime: 30, deliveryFee: 100, image: 'assets/images/restaurant1.jpg' },
    { id: '2', name: 'Pizza Express', cuisine: 'Pizzaria', rating: 4.7, deliveryTime: 45, deliveryFee: 150, image: 'assets/images/restaurant2.jpg' },
    // Adicione mais restaurantes conforme necessário
  ];
  
  return restaurants.find(restaurant => restaurant.id === id);
}

// Função para voltar à página anterior
goBack() {
  this.location.back();
}
}
